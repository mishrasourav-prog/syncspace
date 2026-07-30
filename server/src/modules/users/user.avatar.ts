import { randomUUID } from "node:crypto";

import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

import {
  getCloudinary,
  getCloudinaryAvatarFolder,
} from "../../config/cloudinary";

import ApiError from "../../utils/ApiError";

export interface UploadedAvatar {
  url: string;

  publicId: string;

  width: number;

  height: number;

  format: string;

  bytes: number;
}

const AVATAR_WIDTH = 512;

const AVATAR_HEIGHT = 512;

export const uploadAvatarBuffer = async (
  buffer: Buffer,
  userId: string,
): Promise<UploadedAvatar> => {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new ApiError(400, "Avatar image is required.");
  }

  const cloudinary = getCloudinary();

  const folder = `${getCloudinaryAvatarFolder()}/${userId}`;

  const publicId = `avatar-${randomUUID()}`;

  const uploadResult = await new Promise<UploadApiResponse>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,

          public_id: publicId,

          resource_type: "image",

          type: "upload",

          overwrite: false,

          unique_filename: false,

          use_filename: false,

          format: "webp",

          transformation: [
            {
              width: AVATAR_WIDTH,

              height: AVATAR_HEIGHT,

              crop: "fill",

              gravity: "auto",

              quality: "auto:good",
            },
          ],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            reject(error);

            return;
          }

          if (!result) {
            reject(new Error("Cloudinary returned no upload result."));

            return;
          }

          resolve(result);
        },
      );

      uploadStream.end(buffer);
    },
  ).catch((error: unknown) => {
    console.error("Cloudinary avatar upload failed:", error);

    throw new ApiError(
      502,
      "Avatar storage is temporarily unavailable. Please try again.",
    );
  });

  if (!uploadResult.secure_url || !uploadResult.public_id) {
    console.error(
      "Cloudinary avatar upload returned an incomplete result:",
      uploadResult,
    );

    throw new ApiError(502, "Avatar storage returned an invalid response.");
  }

  return {
    url: uploadResult.secure_url,

    publicId: uploadResult.public_id,

    width: uploadResult.width,

    height: uploadResult.height,

    format: uploadResult.format,

    bytes: uploadResult.bytes,
  };
};

export const deleteAvatarAsset = async (
  publicId: string | null | undefined,
): Promise<void> => {
  const normalizedPublicId = publicId?.trim();

  if (!normalizedPublicId) {
    return;
  }

  const cloudinary = getCloudinary();

  const result = await cloudinary.uploader
    .destroy(normalizedPublicId, {
      resource_type: "image",

      type: "upload",

      invalidate: true,
    })
    .catch((error: unknown) => {
      console.error(
        `Cloudinary avatar deletion failed for ${normalizedPublicId}:`,
        error,
      );

      throw new ApiError(502, "Avatar cleanup is temporarily unavailable.");
    });

  if (result.result !== "ok" && result.result !== "not found") {
    console.error(
      `Unexpected Cloudinary deletion result for ${normalizedPublicId}:`,
      result,
    );

    throw new ApiError(502, "Avatar cleanup returned an invalid response.");
  }
};

export const deleteAvatarAssetBestEffort = async (
  publicId: string | null | undefined,
): Promise<void> => {
  try {
    await deleteAvatarAsset(publicId);
  } catch (error) {
    console.error("Best-effort avatar cleanup failed:", {
      publicId: publicId ?? null,

      error,
    });
  }
};
