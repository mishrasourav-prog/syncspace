import {
  useMutation,
} from "@tanstack/react-query";

import {
  useAuthStore,
} from "@/app/store";

import type {
  ApiErrorShape,
} from "@/lib/axios";

import {
  forgotPasswordRequest,
  loginRequest,
  logoutRequest,
  resendEmailVerificationRequest,
  resendOtpRequest,
  resetPasswordRequest,
  signupRequest,
  verifyEmailRequest,
  verifyOtpRequest,
} from "../api/auth.api";

import type {
  ApiResponse,
} from "../types/api.types";

import type {
  AuthSession,
  ForgotPasswordPayload,
  LoginPayload,
  PendingRegistrationResponse,
  ResetPasswordPayload,
  SignupPayload,
  VerifyEmailResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from "../types/auth.types";

export function useLoginMutation() {
  const setUser =
    useAuthStore(
      (state) =>
        state.setUser
    );

  return useMutation<
    AuthSession,
    ApiErrorShape,
    LoginPayload
  >({
    mutationFn:
      loginRequest,
    onSuccess: (
      session
    ) => {
      setUser(
        session.user
      );
    },
  });
}

export function useSignupMutation() {
  return useMutation<
    PendingRegistrationResponse,
    ApiErrorShape,
    SignupPayload
  >({
    mutationFn:
      signupRequest,
  });
}

export function useVerifyEmailMutation() {
  return useMutation<
    VerifyEmailResponse,
    ApiErrorShape,
    VerifyOtpPayload
  >({
    mutationFn:
      verifyEmailRequest,
  });
}

export function useResendEmailVerificationMutation() {
  return useMutation<
    PendingRegistrationResponse,
    ApiErrorShape,
    string
  >({
    mutationFn:
      resendEmailVerificationRequest,
  });
}

export function useForgotPasswordMutation() {
  return useMutation<
    ApiResponse<void>,
    ApiErrorShape,
    ForgotPasswordPayload
  >({
    mutationFn:
      forgotPasswordRequest,
  });
}

export function useVerifyOtpMutation() {
  return useMutation<
    VerifyOtpResponse,
    ApiErrorShape,
    VerifyOtpPayload
  >({
    mutationFn:
      verifyOtpRequest,
  });
}

export function useResendOtpMutation() {
  return useMutation<
    ApiResponse<void>,
    ApiErrorShape,
    string
  >({
    mutationFn:
      resendOtpRequest,
  });
}

export function useResetPasswordMutation() {
  return useMutation<
    ApiResponse<void>,
    ApiErrorShape,
    ResetPasswordPayload
  >({
    mutationFn:
      resetPasswordRequest,
  });
}

export function useLogoutMutation() {
  return useMutation<
    ApiResponse<void>,
    ApiErrorShape
  >({
    mutationFn:
      logoutRequest,
  });
}
