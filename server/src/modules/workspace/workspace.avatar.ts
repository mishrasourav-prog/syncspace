import { randomUUID } from "node:crypto";

import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

import {
  getCloudinary,
  getCloudinaryWorkspaceAvatarFolder,
} from "../../config/cloudinary";

import ApiError from "../../utils/ApiError";

import { deleteAvatarAssetBestEffort } from "../users/user.avatar";

export interface UploadedWorkspaceAvatar {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

const WORKSPACE_AVATAR_WIDTH = 512;

const WORKSPACE_AVATAR_HEIGHT = 512;

export const uploadWorkspaceAvatarBuffer = async (
  buffer: Buffer,
  workspaceId: string,
): Promise<UploadedWorkspaceAvatar> => {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new ApiError(400, "Workspace avatar image is required.");
  }

  const cloudinary = getCloudinary();

  const folder = `${getCloudinaryWorkspaceAvatarFolder()}/${workspaceId}`;

  const publicId = `workspace-avatar-${randomUUID()}`;

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
              width: WORKSPACE_AVATAR_WIDTH,
              height: WORKSPACE_AVATAR_HEIGHT,
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
            reject(
              new Error(
                "Cloudinary returned no workspace avatar upload result.",
              ),
            );

            return;
          }

          resolve(result);
        },
      );

      uploadStream.end(buffer);
    },
  ).catch((error: unknown) => {
    console.error("Cloudinary workspace avatar upload failed:", error);

    throw new ApiError(
      502,
      "Workspace avatar storage is temporarily unavailable. Please try again.",
    );
  });

  if (!uploadResult.secure_url || !uploadResult.public_id) {
    console.error(
      "Cloudinary workspace avatar upload returned an incomplete result:",
      uploadResult,
    );

    throw new ApiError(
      502,
      "Workspace avatar storage returned an invalid response.",
    );
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

export const deleteWorkspaceAvatarAssetBestEffort = deleteAvatarAssetBestEffort;
