export type AuthProvider =
  | "email"
  | "google"
  | "facebook"
  | "twitter"
  | "github";

/**
 * Safe user information returned by authentication endpoints.
 *
 * Never include password, refreshToken, providerId,
 * sessionVersion, or deletion metadata here.
 */
export interface IUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

/**
 * Response returned by the authenticated-user endpoint.
 */
export interface CurrentUserResponse {
  user: IUser;
}

/**
 * Compatibility alias for existing imports that currently use
 * the lowercase `currentUser` name.
 *
 * We can gradually replace old imports with CurrentUserResponse
 * without breaking the existing project.
 */
export type currentUser = CurrentUserResponse;

/**
 * Payload stored inside access and refresh JWTs.
 *
 * sessionVersion allows the backend to invalidate every old token
 * immediately after:
 *
 * - Logout
 * - Password change
 * - Password reset
 * - Account deletion
 */
export interface IJwtPayload {
  _id: string;
  email: string;
  username: string;
  sessionVersion: number;

  /**
   * Automatically added by jsonwebtoken.
   */
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

export interface LoginResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface ResetResponse {
  email: string;
  resetToken: string;
}