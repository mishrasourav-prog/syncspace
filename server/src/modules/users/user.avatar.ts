import {
  randomUUID,
} from "node:crypto";

import type {
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";

import {
  getCloudinary,
  getCloudinaryAvatarFolder,
} from "../../config/cloudinary";

import ApiError from "../../utils/ApiError";

/*
|--------------------------------------------------------------------------
| Stored Avatar Result
|--------------------------------------------------------------------------
*/

export interface UploadedAvatar {
  url: string;

  publicId: string;

  width: number;

  height: number;

  format: string;

  bytes: number;
}

/*
|--------------------------------------------------------------------------
| Upload Constants
|--------------------------------------------------------------------------
|
| Every uploaded avatar is normalized to a predictable square image.
|
| The original browser filename is deliberately ignored.
|
*/

const AVATAR_WIDTH =
  512;

const AVATAR_HEIGHT =
  512;

/*
|--------------------------------------------------------------------------
| Cloudinary Upload
|--------------------------------------------------------------------------
*/

export const uploadAvatarBuffer =
  async (
    buffer: Buffer,
    userId: string
  ): Promise<UploadedAvatar> => {
    if (
      !Buffer.isBuffer(
        buffer
      ) ||
      buffer.length ===
        0
    ) {
      throw new ApiError(
        400,
        "Avatar image is required."
      );
    }

    const cloudinary =
      getCloudinary();

    const folder =
      `${getCloudinaryAvatarFolder()}/${userId}`;

    const publicId =
      `avatar-${randomUUID()}`;

    const uploadResult =
      await new Promise<UploadApiResponse>(
        (
          resolve,
          reject
        ) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder,

                public_id:
                  publicId,

                resource_type:
                  "image",

                type:
                  "upload",

                overwrite:
                  false,

                unique_filename:
                  false,

                use_filename:
                  false,

                /*
                Normalize every accepted JPEG, PNG, or WebP input to one
                square WebP avatar. Cloudinary applies this transformation
                before storing the resulting asset.
                */
                format:
                  "webp",

                transformation: [
                  {
                    width:
                      AVATAR_WIDTH,

                    height:
                      AVATAR_HEIGHT,

                    crop:
                      "fill",

                    gravity:
                      "auto",

                    quality:
                      "auto:good",
                  },
                ],
              },
              (
                error:
                  UploadApiErrorResponse |
                  undefined,
                result:
                  UploadApiResponse |
                  undefined
              ) => {
                if (
                  error
                ) {
                  reject(
                    error
                  );

                  return;
                }

                if (
                  !result
                ) {
                  reject(
                    new Error(
                      "Cloudinary returned no upload result."
                    )
                  );

                  return;
                }

                resolve(
                  result
                );
              }
            );

          uploadStream.end(
            buffer
          );
        }
      ).catch(
        (
          error:
            unknown
        ) => {
          /*
          Avoid forwarding Cloudinary SDK details or credentials to clients.
          The original error remains available in server logs.
          */
          console.error(
            "Cloudinary avatar upload failed:",
            error
          );

          throw new ApiError(
            502,
            "Avatar storage is temporarily unavailable. Please try again."
          );
        }
      );

    if (
      !uploadResult.secure_url ||
      !uploadResult.public_id
    ) {
      console.error(
        "Cloudinary avatar upload returned an incomplete result:",
        uploadResult
      );

      throw new ApiError(
        502,
        "Avatar storage returned an invalid response."
      );
    }

    return {
      url:
        uploadResult.secure_url,

      publicId:
        uploadResult.public_id,

      width:
        uploadResult.width,

      height:
        uploadResult.height,

      format:
        uploadResult.format,

      bytes:
        uploadResult.bytes,
    };
  };

/*
|--------------------------------------------------------------------------
| Delete Avatar Asset
|--------------------------------------------------------------------------
|
| This strict function is useful when a caller needs to know whether cleanup
| succeeded. "not found" is idempotent success because the desired final state
| has already been reached.
|
*/

export const deleteAvatarAsset =
  async (
    publicId:
      string |
      null |
      undefined
  ): Promise<void> => {
    const normalizedPublicId =
      publicId?.trim();

    if (
      !normalizedPublicId
    ) {
      return;
    }

    const cloudinary =
      getCloudinary();

    const result =
      await cloudinary.uploader
        .destroy(
          normalizedPublicId,
          {
            resource_type:
              "image",

            type:
              "upload",

            invalidate:
              true,
          }
        )
        .catch(
          (
            error:
              unknown
          ) => {
            console.error(
              `Cloudinary avatar deletion failed for ${normalizedPublicId}:`,
              error
            );

            throw new ApiError(
              502,
              "Avatar cleanup is temporarily unavailable."
            );
          }
        );

    if (
      result.result !==
        "ok" &&
      result.result !==
        "not found"
    ) {
      console.error(
        `Unexpected Cloudinary deletion result for ${normalizedPublicId}:`,
        result
      );

      throw new ApiError(
        502,
        "Avatar cleanup returned an invalid response."
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Best-Effort Cleanup
|--------------------------------------------------------------------------
|
| Profile replacement/removal and account deletion update MongoDB first.
| Failure to remove the old external image must not roll back or misrepresent
| the already-committed account change.
|
| The failure is logged for operational monitoring and later cleanup.
|
*/

export const deleteAvatarAssetBestEffort =
  async (
    publicId:
      string |
      null |
      undefined
  ): Promise<void> => {
    try {
      await deleteAvatarAsset(
        publicId
      );
    } catch (
      error
    ) {
      console.error(
        "Best-effort avatar cleanup failed:",
        {
          publicId:
            publicId ??
            null,

          error,
        }
      );
    }
  };