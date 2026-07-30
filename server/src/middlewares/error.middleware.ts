import type { NextFunction, Request, Response } from "express";

import mongoose from "mongoose";

import { MulterError } from "multer";

import { ZodError } from "zod";

import ApiError from "../utils/ApiError";

interface ValidationErrorItem {
  field: string;

  message: string;
}

interface MongoDuplicateKeyError {
  code: 11000;

  keyPattern?: Record<string, number>;

  keyValue?: Record<string, unknown>;
}

const isMongoDuplicateKeyError = (
  error: unknown,
): error is MongoDuplicateKeyError => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  return (
    "code" in error &&
    (
      error as {
        code?: unknown;
      }
    ).code === 11000
  );
};

const getDuplicateFieldMessage = (field: string): string => {
  switch (field) {
    case "email":
      return "Email is already registered.";

    case "username":
      return "Username is already taken.";

    default:
      return `A record with the same ${field} already exists.`;
  }
};

interface ExternalMediaStorageError {
  http_code: number;

  message?: string;
}

const isExternalMediaStorageError = (
  error: unknown,
): error is ExternalMediaStorageError => {
  if (typeof error !== "object" || error === null || !("http_code" in error)) {
    return false;
  }

  const httpCode = (
    error as {
      http_code?: unknown;
    }
  ).http_code;

  return typeof httpCode === "number" && Number.isFinite(httpCode);
};

const isMalformedJsonError = (
  error: unknown,
): error is SyntaxError & {
  status?: number;
  body?: unknown;
} => {
  return (
    error instanceof SyntaxError &&
    typeof error === "object" &&
    error !== null &&
    "body" in error
  );
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): Response | void => {
  if (res.headersSent) {
    next(err);

    return;
  }

  let error: unknown = err;

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,

      message: error.message,

      errors: error.errors ?? [],
    });
  }

  if (error instanceof ZodError) {
    const validationErrors: ValidationErrorItem[] = error.issues.map(
      (issue) => ({
        field: issue.path.map(String).join(".") || "request",

        message: issue.message,
      }),
    );

    error = new ApiError(400, "Validation failed.", validationErrors);
  } else if (error instanceof MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        error = new ApiError(413, "Uploaded file is too large.");

        break;

      case "LIMIT_FILE_COUNT":
        error = new ApiError(400, "Too many files were uploaded.");

        break;

      case "LIMIT_UNEXPECTED_FILE":
        error = new ApiError(400, "An unexpected upload field was provided.");

        break;

      default:
        error = new ApiError(400, "The uploaded file could not be processed.");
    }
  } else if (error instanceof mongoose.Error.VersionError) {
    error = new ApiError(
      409,
      "This resource was modified by another request. Refresh and try again.",
    );
  } else if (isMongoDuplicateKeyError(error)) {
    const duplicateFields = Object.keys(
      error.keyPattern ?? error.keyValue ?? {},
    );

    const validationErrors: ValidationErrorItem[] = duplicateFields.map(
      (field) => ({
        field,

        message: getDuplicateFieldMessage(field),
      }),
    );

    const message =
      duplicateFields.length === 1
        ? getDuplicateFieldMessage(duplicateFields[0])
        : duplicateFields.length > 1
          ? "A record with those unique values already exists."
          : "A record with the same unique value already exists.";

    error = new ApiError(409, message, validationErrors);
  } else if (error instanceof mongoose.Error.ValidationError) {
    const validationErrors: ValidationErrorItem[] = Object.entries(
      error.errors,
    ).map(([field, validationError]) => ({
      field,

      message: validationError.message,
    }));

    error = new ApiError(400, "Validation failed.", validationErrors);
  } else if (error instanceof mongoose.Error.CastError) {
    error = new ApiError(400, `Invalid value for ${error.path}.`, [
      {
        field: error.path,

        message: `Invalid value for ${error.path}.`,
      },
    ]);
  } else if (isMalformedJsonError(error)) {
    error = new ApiError(400, "Request body contains invalid JSON.");
  } else if (isExternalMediaStorageError(error)) {
    console.error("External media-storage error:", error);

    error = new ApiError(
      502,
      "Avatar storage is temporarily unavailable. Please try again.",
    );
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,

      message: error.message,

      errors: error.errors ?? [],
    });
  }

  console.error("Unhandled application error:", err);

  return res.status(500).json({
    success: false,

    message: "Internal Server Error",

    errors: [],
  });
};
