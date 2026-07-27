import { axiosClient } from "@/lib/axios";
import type {
  AuthSession,
  LoginPayload,
  SignupPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  AuthUser,
  ResetPasswordPayload,
  VerifyOtpResponse
} from "../types/auth.types.ts";

import type { ApiResponse } from "../types/api.types.ts";

export async function loginRequest(payload: LoginPayload): Promise<AuthSession> {
  return axiosClient.post<ApiResponse<AuthSession>>("/auth/login", payload).then((res) => res.data.data);
}

export async function signupRequest(payload: SignupPayload): Promise<AuthUser> {
  return axiosClient.post<ApiResponse<AuthUser>>("/auth/register", payload).then((res) => res.data.data);
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

