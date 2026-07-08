import { axiosClient } from "@/lib/axios";
import type {
  AuthSession,
  LoginPayload,
  SignupPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  UploadAvatarPayload,
  AuthUser,
  ResetPasswordPayload,
  VerifyOtpResponse
} from "../types/auth.types.ts";

import type { ApiResponse } from "../types/api.types.ts";

const simulateNetwork = <T,>(data: T, ms = 500): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export async function loginRequest(payload: LoginPayload): Promise<AuthSession> {
  return axiosClient.post<ApiResponse<AuthSession>>("/auth/login", payload).then((res) => res.data.data);
}

export async function signupRequest(payload: SignupPayload): Promise<AuthUser> {
  return axiosClient.post<ApiResponse<AuthUser>>("/auth/register", payload).then((res) => res.data.data);
}

export async function uploadAvatarRequest(payload: UploadAvatarPayload): Promise<{ avatarUrl: string }> {
  // const formData = new FormData();
  // formData.append("avatar", payload.file);
  // formData.append("email", payload.email);
  // return axiosClient
  //   .post("/auth/upload-avatar", formData, { headers: { "Content-Type": "multipart/form-data" } })
  //   .then((res) => res.data);
  return simulateNetwork({ avatarUrl: URL.createObjectURL(payload.file) }, 400);
}

export async function forgotPasswordRequest(payload: ForgotPasswordPayload): Promise<ApiResponse<void>> {
  return axiosClient.post<ApiResponse<void>>("/auth/forgot-password", payload).then((res) => res.data);
 
}

export async function verifyOtpRequest(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  return axiosClient.post<ApiResponse<VerifyOtpResponse>>("/auth/verify-reset-otp", payload).then((res) => res.data.data);
  // return simulateNetwork({
  //   user: { id: "u1", fullName: "Saurav Mishra", email: payload.email },
  //   accessToken: "mock-token",
  // });
}

export async function resetPasswordRequest(payload:ResetPasswordPayload) : Promise<ApiResponse<void>>{
  return axiosClient.post<ApiResponse<void>>("/auth/reset-password",payload).then((res)=>res.data);

}

export async function resendOtpRequest(
    email: string
): Promise<ApiResponse<void>> {
    return axiosClient
        .post<ApiResponse<void>>(
            "/auth/resend-reset-otp",
            { email }
        )
        .then((res) => res.data);
}

export async function logoutRequest(): Promise<ApiResponse<void>> {
  return axiosClient
    .post<ApiResponse<void>>("/auth/logout")
    .then((res) => res.data);
}

export function getCurrentUserRequest(){
    return axiosClient
        .get<ApiResponse<{user:AuthUser}>>("/auth/me")
        .then(res=>res.data.data.user);
}

