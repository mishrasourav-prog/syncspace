import type { CookieOptions, NextFunction, Request, Response } from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import AuthService from "./auth.service";

import {
  forgotPasswordSchema,
  loginUserSchema,
  registerUserSchema,
  resendEmailVerificationSchema,
  resendOtpSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyOtpSchema,
} from "./auth.validation";

const isProduction = process.env.NODE_ENV === "production";

const baseAuthCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "strict",
  path: "/",
};

const accessTokenCookieOptions: CookieOptions = {
  ...baseAuthCookieOptions,
  maxAge: 15 * 60 * 1000,
};

const refreshTokenCookieOptions: CookieOptions = {
  ...baseAuthCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearAuthenticationCookies = (res: Response): Response => {
  res.clearCookie("accessToken", baseAuthCookieOptions);

  res.clearCookie("refreshToken", baseAuthCookieOptions);

  return res;
};

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const payload = registerUserSchema.parse(req.body);

    const result = await AuthService.registerUser(payload);

    return res
      .status(202)
      .json(
        new ApiResponse(202, "Verification code sent to your email.", result),
      );
  } catch (error) {
    return next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const payload = verifyEmailSchema.parse(req.body);

    const user = await AuthService.verifyEmailRegistration(
      payload.email,
      payload.otp,
    );

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Email verified and account created successfully.",
          { user },
        ),
      );
  } catch (error) {
    return next(error);
  }
};

export const resendEmailVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const payload = resendEmailVerificationSchema.parse(req.body);

    const result = await AuthService.resendEmailVerificationOtp(payload.email);

    return res
      .status(200)
      .json(
        new ApiResponse(200, "A new verification code has been sent.", result),
      );
  } catch (error) {
    return next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const payload = loginUserSchema.parse(req.body);

    const { user, accessToken, refreshToken } =
      await AuthService.loginUser(payload);

    return res
      .cookie("accessToken", accessToken, accessTokenCookieOptions)
      .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
      .status(200)
      .json(
        new ApiResponse(200, "Login successful.", {
          user,
        }),
      );
  } catch (error) {
    return next(error);
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }

    await AuthService.logoutUser(req.user._id);

    clearAuthenticationCookies(res);

    return res
      .status(200)
      .json(new ApiResponse(200, "Logged out successfully."));
  } catch (error) {
    clearAuthenticationCookies(res);

    return next(error);
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (typeof refreshToken !== "string" || refreshToken.length === 0) {
      throw new ApiError(401, "Refresh token missing.");
    }

    const accessToken = await AuthService.refreshAccessToken(refreshToken);

    return res
      .cookie("accessToken", accessToken, accessTokenCookieOptions)
      .status(200)
      .json(new ApiResponse(200, "Session refreshed successfully."));
  } catch (error) {
    clearAuthenticationCookies(res);

    return next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }

    const payload = await AuthService.getCurrentUser(req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "User fetched successfully.", payload));
  } catch (error) {
    return next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const payload = forgotPasswordSchema.parse(req.body);

    await AuthService.forgotPassword(payload.email);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "If an account with that email exists, a password reset OTP has been sent.",
        ),
      );
  } catch (error) {
    return next(error);
  }
};

export const verifyOtpResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const payload = verifyOtpSchema.parse(req.body);

    const result = await AuthService.verifyOtpResetPassword(
      payload.email,
      payload.otp,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "OTP verified successfully.", result));
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const payload = resetPasswordSchema.parse(req.body);

    await AuthService.resetPassword(
      payload.email,
      payload.resetToken,
      payload.newPassword,
    );

    clearAuthenticationCookies(res);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Password reset successfully. Please sign in again.",
        ),
      );
  } catch (error) {
    return next(error);
  }
};

export const resendResetOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const payload = resendOtpSchema.parse(req.body);

    await AuthService.resendResetOtp(payload.email);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "If an account with that email exists, a password reset OTP has been sent.",
        ),
      );
  } catch (error) {
    return next(error);
  }
};
