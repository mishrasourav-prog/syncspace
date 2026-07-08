// import axios, { type AxiosError } from "axios";


// export const axiosClient = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
//   timeout: 10_000,
//   headers: { "Content-Type": "application/json" },
//   withCredentials: true,
// });

// export interface ApiErrorShape {
//   message: string;
//   status?: number;
// }

// axiosClient.interceptors.response.use(
//   (response) => response,
//   (error: AxiosError<{ message?: string }>) => {
//     const normalized: ApiErrorShape = {
//       message: error.response?.data?.message ?? "Something went wrong. Please try again.",
//       status: error.response?.status,
//     };
//     return Promise.reject(normalized);
//   }
// );

import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { useAuthStore } from "@/app/store";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export interface ApiErrorShape {
  message: string;
  status?: number;
}

let isRefreshing = false;

let failedQueue: {
  resolve: () => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error?: unknown) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register") &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(axiosClient(originalRequest)),
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        await axiosClient.post("/auth/refresh");

        processQueue();

        return axiosClient(originalRequest);
      } catch (refreshError) {
        
        processQueue(refreshError);

        useAuthStore.getState().clearSession();

        return Promise.reject({
          message: "Session expired. Please log in again.",
          status: 401,
        });
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject({
      message:
        error.response?.data?.message ??
        "Something went wrong. Please try again.",
      status: error.response?.status,
    });
  }
);