import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";

import {
    useAuthStore,
} from "@/app/store";

import {
    queryClient,
} from "@/lib/queryClient";

export const axiosClient =
    axios.create({
        baseURL:
            import.meta.env
                .VITE_API_BASE_URL ??
            "/api/v1",

        timeout:
            10_000,


        withCredentials:
            true,
    });

export interface ApiErrorShape {
    message:
        string;

    status?:
        number;
}

interface RetryableRequestConfig
    extends InternalAxiosRequestConfig {
    _retry?:
        boolean;
}

interface PendingRequest {
    resolve:
        () => void;

    reject:
        (
            error:
                unknown
        ) => void;
}

const PUBLIC_AUTH_PATHS = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/verify-reset-otp",
    "/auth/reset-password",
    "/auth/resend-reset-otp",
    "/auth/refresh",
] as const;

let isRefreshing =
    false;

let failedQueue:
    PendingRequest[] =
    [];

function isPublicAuthRequest(
    url:
        string |
        undefined
): boolean {
    if (
        !url
    ) {
        return false;
    }

    return PUBLIC_AUTH_PATHS.some(
        (
            path
        ) =>
            url.includes(
                path
            )
    );
}

function processQueue(
    error?:
        unknown
): void {
    failedQueue.forEach(
        (
            request
        ) => {
            if (
                error
            ) {
                request.reject(
                    error
                );

                return;
            }

            request.resolve();
        }
    );

    failedQueue =
        [];
}

function normalizeApiError(
    error:
        AxiosError<{
            message?:
                string;
        }>
): ApiErrorShape {
    return {
        message:
            error.response
                ?.data
                ?.message ??
            "Something went wrong. Please try again.",

        status:
            error.response
                ?.status,
    };
}

axiosClient.interceptors.response.use(
    (
        response
    ) =>
        response,

    async (
        error:
            AxiosError<{
                message?:
                    string;
            }>
    ) => {
        const originalRequest =
            error.config as
                | RetryableRequestConfig
                | undefined;

        const shouldRefresh =
            error.response
                ?.status ===
                401 &&
            Boolean(
                originalRequest
            ) &&
            !originalRequest
                ?._retry &&
            !isPublicAuthRequest(
                originalRequest
                    ?.url
            );

        if (
            !shouldRefresh ||
            !originalRequest
        ) {
            return Promise.reject(
                normalizeApiError(
                    error
                )
            );
        }

        originalRequest._retry =
            true;

        if (
            isRefreshing
        ) {
            return new Promise(
                (
                    resolve,
                    reject
                ) => {
                    failedQueue.push({
                        resolve:
                            () => {
                                resolve(
                                    axiosClient(
                                        originalRequest
                                    )
                                );
                            },

                        reject,
                    });
                }
            );
        }

        isRefreshing =
            true;

        try {
            await axiosClient.post(
                "/auth/refresh"
            );

            processQueue();

            return axiosClient(
                originalRequest
            );
        } catch (
            refreshError
        ) {
            processQueue(
                refreshError
            );

            useAuthStore
                .getState()
                .clearSession();

            queryClient.clear();

            return Promise.reject({
                message:
                    "Session expired. Please log in again.",

                status:
                    401,
            } satisfies ApiErrorShape);
        } finally {
            isRefreshing =
                false;
        }
    }
);