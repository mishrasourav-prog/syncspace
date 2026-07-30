export type AuthProvider =
  "email" | "google" | "facebook" | "twitter" | "github";

export interface IUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface CurrentUserResponse {
  user: IUser;
}

export type currentUser = CurrentUserResponse;

export interface IJwtPayload {
  _id: string;
  email: string;
  username: string;
  sessionVersion: number;

  iat?: number;
  exp?: number;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface RegisterUser {
  email: string;
  password: string;
  name: string;
  username: string;
}

export interface PendingRegistrationResponse {
  email: string;
  expiresInSeconds: number;
  resendAvailableInSeconds: number;
}

export interface LoginResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface ResetResponse {
  email: string;
  resetToken: string;
}
