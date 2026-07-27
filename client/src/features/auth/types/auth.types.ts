import type {
  ForgotPasswordFormValues,
  LoginFormValues,
} from "../schemas/auth.schemas";

export interface AuthUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface AuthSession {
  user: AuthUser;
}

export type LoginPayload = LoginFormValues;

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

export type SignupPayload = RegisterPayload;


export type ForgotPasswordPayload = ForgotPasswordFormValues;

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface forgotPasswordResponse {
  email: string;
}

export interface VerifyOtpResponse {
    email: string;
    resetToken: string;
}

export interface ResetPasswordPayload {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
}

