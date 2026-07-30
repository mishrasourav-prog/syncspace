import type {
  CookieOptions,
  NextFunction,
  Request,
  Response,
} from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import {
  deleteAvatarAssetBestEffort,
  uploadAvatarBuffer,
} from "./user.avatar";

import UserService from "./user.service";

import {
  changePasswordSchema,
  deleteAccountSchema,
  memberProfileParamsSchema,
  memberProfileQuerySchema,
  updateSelfProfileSchema,
} from "./user.validation";

/*
|--------------------------------------------------------------------------
| Authentication Cookie Cleanup
|--------------------------------------------------------------------------
|
| These options must match the options used by the auth controller when the
| cookies were created.
|
*/

const baseAuthCookieOptions:
  CookieOptions = {
    httpOnly: true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite:
  process.env.NODE_ENV === "production"
    ? "none"
    : "strict",

    path:
      "/",
  };

const clearAuthenticationCookies = (
  res: Response
): void => {
  res.clearCookie(
    "accessToken",
    baseAuthCookieOptions
  );

  res.clearCookie(
    "refreshToken",
    baseAuthCookieOptions
  );
};

/*
|--------------------------------------------------------------------------
| Authenticated User Guard
|--------------------------------------------------------------------------
|
| The route middleware normally guarantees req.user. This guard keeps every
| controller safe when called directly in tests or after route refactoring.
|
*/

const getAuthenticatedUserId = (
  req: Request
): string => {
  const userId =
    req.user?._id;

  if (
    !userId
  ) {
    throw new ApiError(
      401,
      "Authentication required."
    );
  }

  return userId;
};

/*
|--------------------------------------------------------------------------
| Get Self Profile
|--------------------------------------------------------------------------
*/

export const getSelfProfile =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const profile =
        await UserService
          .getSelfProfile(
            getAuthenticatedUserId(
              req
            )
          );

      return res
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "Profile fetched successfully.",
            profile
          )
        );
    } catch (
      error
    ) {
      return next(
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Update Self Profile
|--------------------------------------------------------------------------
*/

export const updateSelfProfile =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const payload =
        updateSelfProfileSchema.parse(
          req.body
        );

      const result =
        await UserService
          .updateSelfProfile(
            getAuthenticatedUserId(
              req
            ),
            payload
          );

      /*
      When a direct avatar URL replaces a previously managed Cloudinary
      avatar, remove the old hosted asset after MongoDB has committed.
      */
      await deleteAvatarAssetBestEffort(
        result.previousAvatarPublicId
      );

      return res
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "Profile updated successfully.",
            result.profile
          )
        );
    } catch (
      error
    ) {
      return next(
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Upload and Replace Avatar
|--------------------------------------------------------------------------
|
| `uploadAvatar` from user.upload.ts runs before this controller and guarantees
| that req.file contains one verified JPEG, PNG, or WebP image.
|
*/

export const replaceAvatar =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    let uploadedPublicId:
      string |
      null =
        null;

    try {
      const userId =
        getAuthenticatedUserId(
          req
        );

      if (
        !req.file
      ) {
        throw new ApiError(
          400,
          'An avatar image is required in the "avatar" field.'
        );
      }

      const uploadedAvatar =
        await uploadAvatarBuffer(
          req.file.buffer,
          userId
        );

      uploadedPublicId =
        uploadedAvatar.publicId;

      let result;

      try {
        result =
          await UserService
            .replaceAvatar(
              userId,
              uploadedAvatar.url,
              uploadedAvatar.publicId
            );
      } catch (
        error
      ) {
        /*
        The new external asset exists but MongoDB was not updated. Remove that
        orphan before forwarding the authoritative database error.
        */
        await deleteAvatarAssetBestEffort(
          uploadedAvatar.publicId
        );

        uploadedPublicId =
          null;

        throw error;
      }

      uploadedPublicId =
        null;

      /*
      MongoDB now points to the new avatar. The old hosted asset is no longer
      authoritative and can be removed independently.
      */
      await deleteAvatarAssetBestEffort(
        result.previousAvatarPublicId
      );

      return res
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "Avatar updated successfully.",
            result.profile
          )
        );
    } catch (
      error
    ) {
      /*
      Defensive cleanup for an unexpected failure after upload but before the
      normal database-failure cleanup branch executes.
      */
      if (
        uploadedPublicId
      ) {
        await deleteAvatarAssetBestEffort(
          uploadedPublicId
        );
      }

      return next(
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Remove Avatar
|--------------------------------------------------------------------------
*/

export const removeAvatar =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const result =
        await UserService
          .removeAvatar(
            getAuthenticatedUserId(
              req
            )
          );

      await deleteAvatarAssetBestEffort(
        result.previousAvatarPublicId
      );

      return res
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "Avatar removed successfully.",
            result.profile
          )
        );
    } catch (
      error
    ) {
      return next(
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Change Password
|--------------------------------------------------------------------------
*/

export const changePassword =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const payload =
        changePasswordSchema.parse(
          req.body
        );

      await UserService
        .changePassword(
          getAuthenticatedUserId(
            req
          ),
          payload
        );

      /*
      The service increments sessionVersion and publishes the account-wide
      revocation event. Clear this browser's cookies as part of the same API
      response.
      */
      clearAuthenticationCookies(
        res
      );

      return res
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "Password changed successfully. Please sign in again."
          )
        );
    } catch (
      error
    ) {
      return next(
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Account-Deletion Readiness
|--------------------------------------------------------------------------
*/

export const getDeletionReadiness =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const readiness =
        await UserService
          .getDeletionReadiness(
            getAuthenticatedUserId(
              req
            )
          );

      return res
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "Account-deletion readiness fetched successfully.",
            readiness
          )
        );
    } catch (
      error
    ) {
      return next(
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Delete Account
|--------------------------------------------------------------------------
*/

export const deleteAccount =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const payload =
        deleteAccountSchema.parse(
          req.body
        );

      const cleanup =
        await UserService
          .deleteAccount(
            getAuthenticatedUserId(
              req
            ),
            payload
          );

      /*
      MongoDB deletion/anonymization has committed and every session has been
      revoked. Local browser cookies are now unusable and must be removed.
      */
      clearAuthenticationCookies(
        res
      );

      /*
      External avatar deletion is intentionally best effort. A temporary
      Cloudinary failure must not misrepresent the already-committed account
      deletion as unsuccessful.
      */
      await deleteAvatarAssetBestEffort(
        cleanup.avatarPublicId
      );

      return res
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "Account deleted successfully."
          )
        );
    } catch (
      error
    ) {
      return next(
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Read Context-Authorized Member Profile
|--------------------------------------------------------------------------
*/

export const getMemberProfile =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const params =
        memberProfileParamsSchema.parse(
          req.params
        );

      const query =
        memberProfileQuerySchema.parse(
          req.query
        );

      const profile =
        await UserService
          .getMemberProfile(
            getAuthenticatedUserId(
              req
            ),
            params.userId,
            query
          );

      return res
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "Member profile fetched successfully.",
            profile
          )
        );
    } catch (
      error
    ) {
      return next(
        error
      );
    }
  };