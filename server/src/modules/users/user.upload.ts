import type { NextFunction, Request, RequestHandler, Response } from "express";

import multer, { MulterError } from "multer";

import ApiError from "../../utils/ApiError";

export const AVATAR_UPLOAD_FIELD = "avatar";

export const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  if (!ALLOWED_AVATAR_MIME_TYPES.has(file.mimetype)) {
    callback(new ApiError(400, "Avatar must be a JPEG, PNG, or WebP image."));

    return;
  }

  callback(null, true);
};

const avatarUploader = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: MAX_AVATAR_FILE_SIZE,

    files: 1,
  },
}).single(AVATAR_UPLOAD_FIELD);

const detectImageMimeType = (
  buffer: Buffer,
): "image/jpeg" | "image/png" | "image/webp" | null => {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
};

const translateUploadError = (error: unknown): Error => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return new ApiError(413, "Avatar image must be 5 MB or smaller.");

      case "LIMIT_UNEXPECTED_FILE":
        return new ApiError(
          400,
          `Upload exactly one image using the "${AVATAR_UPLOAD_FIELD}" field.`,
        );

      case "LIMIT_FILE_COUNT":
        return new ApiError(
          400,
          "Only one avatar image can be uploaded at a time.",
        );

      default:
        return new ApiError(400, "Avatar upload could not be processed.");
    }
  }

  return new ApiError(400, "Avatar upload could not be processed.");
};

export const uploadAvatar: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  avatarUploader(req, res, (error: unknown) => {
    if (error) {
      next(translateUploadError(error));

      return;
    }

    if (!req.file || req.file.size === 0 || req.file.buffer.length === 0) {
      next(
        new ApiError(
          400,
          `An avatar image is required in the "${AVATAR_UPLOAD_FIELD}" field.`,
        ),
      );

      return;
    }

    const detectedMimeType = detectImageMimeType(req.file.buffer);

    if (!detectedMimeType || detectedMimeType !== req.file.mimetype) {
      next(
        new ApiError(
          400,
          "Avatar file contents do not match a supported JPEG, PNG, or WebP image.",
        ),
      );

      return;
    }

    next();
  });
};

export default uploadAvatar;
