import { axiosClient } from "@/lib/axios";

import type { ApiResponse } from "../types/api.types";

import type {
  AuthSession,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  PendingRegistrationResponse,
  ResetPasswordPayload,
  SignupPayload,
  VerifyEmailResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from "../types/auth.types";

export async function loginRequest(
  payload: LoginPayload,
): Promise<AuthSession> {
  return axiosClient
    .post<ApiResponse<AuthSession>>("/auth/login", payload)
    .then((response) => response.data.data);
}

export async function signupRequest(
  payload: SignupPayload,
): Promise<PendingRegistrationResponse> {
  return axiosClient
    .post<ApiResponse<PendingRegistrationResponse>>("/auth/register", payload, {
      timeout: 50_000,
    })
    .then((response) => response.data.data);
}

export async function verifyEmailRequest(
  payload: VerifyOtpPayload,
): Promise<VerifyEmailResponse> {
  return axiosClient
    .post<ApiResponse<VerifyEmailResponse>>("/auth/verify-email", payload, {
      timeout: 50_000,
    })
    .then((response) => response.data.data);
}

export async function resendEmailVerificationRequest(
  email: string,
): Promise<PendingRegistrationResponse> {
  return axiosClient
    .post<ApiResponse<PendingRegistrationResponse>>(
      "/auth/resend-verification-otp",
      {
        email,
      },
      {
        timeout: 50_000,
      },
    )
    .then((response) => response.data.data);
}

export async function forgotPasswordRequest(
  payload: ForgotPasswordPayload,
): Promise<ApiResponse<void>> {
  return axiosClient
    .post<ApiResponse<void>>("/auth/forgot-password", payload, {
      timeout: 50_000,
    })
    .then((response) => response.data);
}

export async function verifyOtpRequest(
  payload: VerifyOtpPayload,
): Promise<VerifyOtpResponse> {
  return axiosClient
    .post<ApiResponse<VerifyOtpResponse>>("/auth/verify-reset-otp", payload, {
      timeout: 50_000,
    })
    .then((response) => response.data.data);
}

export async function resetPasswordRequest(
  payload: ResetPasswordPayload,
): Promise<ApiResponse<void>> {
  return axiosClient
    .post<ApiResponse<void>>("/auth/reset-password", payload, {
      timeout: 50_000,
    })
    .then((response) => response.data);
}

export async function resendOtpRequest(
  email: string,
): Promise<ApiResponse<void>> {
  return axiosClient
    .post<ApiResponse<void>>(
      "/auth/resend-reset-otp",
      {
        email,
      },
      {
        timeout: 50_000,
      },
    )
    .then((response) => response.data);
}

export async function logoutRequest(): Promise<ApiResponse<void>> {
  return axiosClient
    .post<ApiResponse<void>>("/auth/logout")
    .then((response) => response.data);
}

export function getCurrentUserRequest(): Promise<AuthUser> {
  return axiosClient
    .get<
      ApiResponse<{
        user: AuthUser;
      }>
    >("/auth/me")
    .then((response) => response.data.data.user);
}
