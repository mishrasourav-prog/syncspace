import { useMutation } from "@tanstack/react-query";
import type { ApiErrorShape } from "@/lib/axios";
import { useAuthStore } from "@/app/store";
import {
  loginRequest,
  signupRequest,
  forgotPasswordRequest,
  verifyOtpRequest,
  resendOtpRequest,
  resetPasswordRequest,
  logoutRequest
} from "../api/auth.api";

import type {
  AuthSession,
  LoginPayload,
  SignupPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  AuthUser,
  ResetPasswordPayload,
  VerifyOtpResponse,
} from "../types/auth.types.ts";

import type { ApiResponse } from "../types/api.types.ts";

export function useLoginMutation() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<AuthSession, ApiErrorShape, LoginPayload>({
    mutationFn: loginRequest,
    onSuccess: (session) =>{
    setUser(session.user)}
  });
}

export function useSignupMutation() {
  return useMutation<AuthUser, ApiErrorShape, SignupPayload>({ mutationFn: signupRequest });
}

export function useForgotPasswordMutation() {
  return useMutation<ApiResponse<void>, ApiErrorShape, ForgotPasswordPayload>({
    mutationFn: forgotPasswordRequest,
  });
}

export function useVerifyOtpMutation() {

  return useMutation<
    VerifyOtpResponse,
    ApiErrorShape,
    VerifyOtpPayload
>({
    mutationFn: verifyOtpRequest,
});
}

export function useResendOtpMutation() {
    return useMutation<
        ApiResponse<void>,
        ApiErrorShape,
        string
    >({
        mutationFn: resendOtpRequest,
    });
}

export function useResetPasswordMutation() {
  return useMutation<ApiResponse<void>, ApiErrorShape, ResetPasswordPayload>({
    mutationFn: resetPasswordRequest,
  });
}

export function useLogoutMutation() {
  return useMutation<ApiResponse<void>, ApiErrorShape>({
    mutationFn: logoutRequest,
  });
}