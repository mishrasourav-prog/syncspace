import type { CookieOptions, NextFunction, Request, Response } from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import { deleteAvatarAssetBestEffort, uploadAvatarBuffer } from "./user.avatar";

import UserService from "./user.service";

import {
  changePasswordSchema,
  deleteAccountSchema,
  memberProfileParamsSchema,
  memberProfileQuerySchema,
  updateSelfProfileSchema,
} from "./user.validation";

const baseAuthCookieOptions: CookieOptions = {
  httpOnly: true,

  secure: process.env.NODE_ENV === "production",

  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",

  path: "/",
};

const clearAuthenticationCookies = (res: Response): void => {
  res.clearCookie("accessToken", baseAuthCookieOptions);

  res.clearCookie("refreshToken", baseAuthCookieOptions);
};

const getAuthenticatedUserId = (req: Request): string => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Authentication required.");
  }

  return userId;
};

export const getSelfProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const profile = await UserService.getSelfProfile(
      getAuthenticatedUserId(req),
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Profile fetched successfully.", profile));
  } catch (error) {
    return next(error);
  }
};

export const updateSelfProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const payload = updateSelfProfileSchema.parse(req.body);

    const result = await UserService.updateSelfProfile(
      getAuthenticatedUserId(req),
      payload,
    );

    await deleteAvatarAssetBestEffort(result.previousAvatarPublicId);

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Profile updated successfully.", result.profile),
      );
  } catch (error) {
    return next(error);
  }
};

export const replaceAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  let uploadedPublicId: string | null = null;

  try {
    const userId = getAuthenticatedUserId(req);

    if (!req.file) {
      throw new ApiError(
        400,
        'An avatar image is required in the "avatar" field.',
      );
    }

    const uploadedAvatar = await uploadAvatarBuffer(req.file.buffer, userId);

    uploadedPublicId = uploadedAvatar.publicId;

    let result;

    try {
      result = await UserService.replaceAvatar(
        userId,
        uploadedAvatar.url,
        uploadedAvatar.publicId,
      );
    } catch (error) {
      await deleteAvatarAssetBestEffort(uploadedAvatar.publicId);

      uploadedPublicId = null;

      throw error;
    }

    uploadedPublicId = null;

    await deleteAvatarAssetBestEffort(result.previousAvatarPublicId);

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Avatar updated successfully.", result.profile),
      );
  } catch (error) {
    if (uploadedPublicId) {
      await deleteAvatarAssetBestEffort(uploadedPublicId);
    }

    return next(error);
  }
};

export const removeAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const result = await UserService.removeAvatar(getAuthenticatedUserId(req));

    await deleteAvatarAssetBestEffort(result.previousAvatarPublicId);

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Avatar removed successfully.", result.profile),
      );
  } catch (error) {
    return next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const payload = changePasswordSchema.parse(req.body);

    await UserService.changePassword(getAuthenticatedUserId(req), payload);

    clearAuthenticationCookies(res);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Password changed successfully. Please sign in again.",
        ),
      );
  } catch (error) {
    return next(error);
  }
};

export const getDeletionReadiness = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const readiness = await UserService.getDeletionReadiness(
      getAuthenticatedUserId(req),
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Account-deletion readiness fetched successfully.",
          readiness,
        ),
      );
  } catch (error) {
    return next(error);
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const payload = deleteAccountSchema.parse(req.body);

    const cleanup = await UserService.deleteAccount(
      getAuthenticatedUserId(req),
      payload,
    );

    clearAuthenticationCookies(res);

    await deleteAvatarAssetBestEffort(cleanup.avatarPublicId);

    return res
      .status(200)
      .json(new ApiResponse(200, "Account deleted successfully."));
  } catch (error) {
    return next(error);
  }
};

export const getMemberProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const params = memberProfileParamsSchema.parse(req.params);

    const query = memberProfileQuerySchema.parse(req.query);

    const profile = await UserService.getMemberProfile(
      getAuthenticatedUserId(req),
      params.userId,
      query,
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Member profile fetched successfully.", profile),
      );
  } catch (error) {
    return next(error);
  }
};
