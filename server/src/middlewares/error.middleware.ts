// import {
//     Request,
//     Response,
//     NextFunction,
// } from "express";

// import mongoose from "mongoose";
// import { ZodError } from "zod";

// import ApiError from "../utils/ApiError";

// /*
// |--------------------------------------------------------------------------
// | MongoDB Duplicate-Key Error Type
// |--------------------------------------------------------------------------
// */

// interface IMongoDuplicateKeyError {
//     code: number;

//     keyPattern?: Record<
//         string,
//         number
//     >;

//     keyValue?: Record<
//         string,
//         unknown
//     >;
// }

// const isMongoDuplicateKeyError = (
//     error: unknown
// ): error is IMongoDuplicateKeyError => {
//     if (
//         typeof error !== "object" ||
//         error === null
//     ) {
//         return false;
//     }

//     return (
//         "code" in error &&
//         (error as {
//             code?: unknown;
//         }).code === 11000
//     );
// };

// export const errorHandler = (
//     err: unknown,
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     let error = err;

//     /*
//     |--------------------------------------------------------------------------
//     | Optimistic Concurrency Conflict
//     |--------------------------------------------------------------------------
//     */

//     if (
//         err instanceof
//         mongoose.Error.VersionError
//     ) {
//         error = new ApiError(
//             409,
//             "This resource was modified by another request. Refresh and try again."
//         );
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | MongoDB Duplicate-Key Conflict
//     |--------------------------------------------------------------------------
//     */

//     else if (
//         isMongoDuplicateKeyError(err)
//     ) {
//         const duplicateFields =
//             Object.keys(
//                 err.keyPattern ??
//                 err.keyValue ??
//                 {}
//             );

//         const formattedFields =
//             duplicateFields.length > 0
//                 ? duplicateFields.join(", ")
//                 : "unique fields";

//         error = new ApiError(
//             409,
//             `A record with the same ${formattedFields} already exists.`
//         );
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Mongoose Validation Error
//     |--------------------------------------------------------------------------
//     */

//     else if (
//         err instanceof
//         mongoose.Error.ValidationError
//     ) {
//         const messages =
//             Object.values(
//                 err.errors
//             ).map(
//                 (validationError) =>
//                     validationError.message
//             );

//         error = new ApiError(
//             400,
//             messages.join(" ")
//         );
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Mongoose Cast Error
//     |--------------------------------------------------------------------------
//     */

//     else if (
//         err instanceof
//         mongoose.Error.CastError
//     ) {
//         error = new ApiError(
//             400,
//             `Invalid value for ${err.path}.`
//         );
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Zod Validation Error
//     |--------------------------------------------------------------------------
//     */

//     else if (
//         err instanceof ZodError
//     ) {
//         const validationErrors =
//             err.issues.map(
//                 (issue) => ({
//                     field:
//                         issue.path.join(
//                             "."
//                         ) ||
//                         "request",

//                     message:
//                         issue.message,
//                 })
//             );

//         error = new ApiError(
//             400,
//             "Validation failed.",
//             validationErrors
//         );
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Known Application Error
//     |--------------------------------------------------------------------------
//     */

//     if (error instanceof ApiError) {
//         return res
//             .status(error.statusCode)
//             .json({
//                 success: false,

//                 message:
//                     error.message,

//                 errors:
//                     error.errors ??
//                     [],
//             });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Unexpected Error
//     |--------------------------------------------------------------------------
//     */

//     console.error(
//         "Unhandled application error:",
//         err
//     );

//     return res
//         .status(500)
//         .json({
//             success: false,

//             message:
//                 "Internal Server Error",

//             errors: [],
//         });
// };

import type {
  NextFunction,
  Request,
  Response,
} from "express";

import mongoose from "mongoose";

import {
  MulterError,
} from "multer";

import {
  ZodError,
} from "zod";

import ApiError from "../utils/ApiError";

/*
|--------------------------------------------------------------------------
| Shared Validation Error Shape
|--------------------------------------------------------------------------
*/

interface ValidationErrorItem {
  field: string;

  message: string;
}

/*
|--------------------------------------------------------------------------
| MongoDB Duplicate-Key Error
|--------------------------------------------------------------------------
*/

interface MongoDuplicateKeyError {
  code: 11000;

  keyPattern?: Record<
    string,
    number
  >;

  keyValue?: Record<
    string,
    unknown
  >;
}

const isMongoDuplicateKeyError = (
  error: unknown
): error is MongoDuplicateKeyError => {
  if (
    typeof error !==
      "object" ||
    error ===
      null
  ) {
    return false;
  }

  return (
    "code" in error &&
    (
      error as {
        code?: unknown;
      }
    ).code ===
      11000
  );
};

const getDuplicateFieldMessage = (
  field: string
): string => {
  switch (
    field
  ) {
    case "email":
      return "Email is already registered.";

    case "username":
      return "Username is already taken.";

    default:
      return `A record with the same ${field} already exists.`;
  }
};

/*
|--------------------------------------------------------------------------
| External Media-Storage Error
|--------------------------------------------------------------------------
|
| Cloudinary SDK errors commonly expose an HTTP-style `http_code`. Avatar
| helpers normally translate these into ApiError before reaching this
| middleware, but this guard prevents accidental leakage of raw provider
| responses if an SDK error escapes.
|
*/

interface ExternalMediaStorageError {
  http_code: number;

  message?: string;
}

const isExternalMediaStorageError = (
  error: unknown
): error is ExternalMediaStorageError => {
  if (
    typeof error !==
      "object" ||
    error ===
      null ||
    !(
      "http_code" in
      error
    )
  ) {
    return false;
  }

  const httpCode =
    (
      error as {
        http_code?: unknown;
      }
    ).http_code;

  return (
    typeof httpCode ===
      "number" &&
    Number.isFinite(
      httpCode
    )
  );
};

/*
|--------------------------------------------------------------------------
| Malformed JSON Body
|--------------------------------------------------------------------------
*/

const isMalformedJsonError = (
  error: unknown
): error is SyntaxError & {
  status?: number;
  body?: unknown;
} => {
  return (
    error instanceof
      SyntaxError &&
    typeof error ===
      "object" &&
    error !==
      null &&
    "body" in error
  );
};

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
|
| Response shape is intentionally unchanged:
|
| {
|   success: false,
|   message: string,
|   errors: []
| }
|
*/

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (
    res.headersSent
  ) {
    next(
      err
    );

    return;
  }

  let error:
    unknown =
      err;

  /*
  |--------------------------------------------------------------------------
  | Known Application Error
  |--------------------------------------------------------------------------
  |
  | Preserve service/controller errors exactly as created.
  |
  */

  if (
    error instanceof
      ApiError
  ) {
    return res
      .status(
        error.statusCode
      )
      .json({
        success:
          false,

        message:
          error.message,

        errors:
          error.errors ??
          [],
      });
  }

  /*
  |--------------------------------------------------------------------------
  | Zod Request Validation
  |--------------------------------------------------------------------------
  */

  if (
    error instanceof
      ZodError
  ) {
    const validationErrors:
      ValidationErrorItem[] =
        error.issues.map(
          (
            issue
          ) => ({
            field:
              issue.path
                .map(
                  String
                )
                .join(
                  "."
                ) ||
              "request",

            message:
              issue.message,
          })
        );

    error =
      new ApiError(
        400,
        "Validation failed.",
        validationErrors
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Multer Upload Errors
  |--------------------------------------------------------------------------
  |
  | user.upload.ts translates expected errors itself. This remains as a
  | defensive global fallback for future multipart routes.
  |
  */

  else if (
    error instanceof
      MulterError
  ) {
    switch (
      error.code
    ) {
      case "LIMIT_FILE_SIZE":
        error =
          new ApiError(
            413,
            "Uploaded file is too large."
          );

        break;

      case "LIMIT_FILE_COUNT":
        error =
          new ApiError(
            400,
            "Too many files were uploaded."
          );

        break;

      case "LIMIT_UNEXPECTED_FILE":
        error =
          new ApiError(
            400,
            "An unexpected upload field was provided."
          );

        break;

      default:
        error =
          new ApiError(
            400,
            "The uploaded file could not be processed."
          );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Optimistic Concurrency Conflict
  |--------------------------------------------------------------------------
  */

  else if (
    error instanceof
      mongoose.Error
        .VersionError
  ) {
    error =
      new ApiError(
        409,
        "This resource was modified by another request. Refresh and try again."
      );
  }

  /*
  |--------------------------------------------------------------------------
  | MongoDB Duplicate-Key Conflict
  |--------------------------------------------------------------------------
  */

  else if (
    isMongoDuplicateKeyError(
      error
    )
  ) {
    const duplicateFields =
      Object.keys(
        error.keyPattern ??
        error.keyValue ??
        {}
      );

    const validationErrors:
      ValidationErrorItem[] =
        duplicateFields.map(
          (
            field
          ) => ({
            field,

            message:
              getDuplicateFieldMessage(
                field
              ),
          })
        );

    const message =
      duplicateFields.length ===
        1
        ? getDuplicateFieldMessage(
            duplicateFields[0]
          )
        : duplicateFields.length >
            1
          ? "A record with those unique values already exists."
          : "A record with the same unique value already exists.";

    error =
      new ApiError(
        409,
        message,
        validationErrors
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Mongoose Validation Error
  |--------------------------------------------------------------------------
  */

  else if (
    error instanceof
      mongoose.Error
        .ValidationError
  ) {
    const validationErrors:
      ValidationErrorItem[] =
        Object.entries(
          error.errors
        ).map(
          ([
            field,
            validationError,
          ]) => ({
            field,

            message:
              validationError
                .message,
          })
        );

    error =
      new ApiError(
        400,
        "Validation failed.",
        validationErrors
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Mongoose Cast Error
  |--------------------------------------------------------------------------
  */

  else if (
    error instanceof
      mongoose.Error
        .CastError
  ) {
    error =
      new ApiError(
        400,
        `Invalid value for ${error.path}.`,
        [
          {
            field:
              error.path,

            message:
              `Invalid value for ${error.path}.`,
          },
        ]
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Malformed JSON
  |--------------------------------------------------------------------------
  */

  else if (
    isMalformedJsonError(
      error
    )
  ) {
    error =
      new ApiError(
        400,
        "Request body contains invalid JSON."
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Raw Cloudinary / Media-Storage Failure
  |--------------------------------------------------------------------------
  */

  else if (
    isExternalMediaStorageError(
      error
    )
  ) {
    console.error(
      "External media-storage error:",
      error
    );

    error =
      new ApiError(
        502,
        "Avatar storage is temporarily unavailable. Please try again."
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Normalized Known Error
  |--------------------------------------------------------------------------
  */

  if (
    error instanceof
      ApiError
  ) {
    return res
      .status(
        error.statusCode
      )
      .json({
        success:
          false,

        message:
          error.message,

        errors:
          error.errors ??
          [],
      });
  }

  /*
  |--------------------------------------------------------------------------
  | Unexpected Error
  |--------------------------------------------------------------------------
  |
  | Log the original server-side error, but never expose stack traces,
  | database details, environment values, or provider responses to clients.
  |
  */

  console.error(
    "Unhandled application error:",
    err
  );

  return res
    .status(
      500
    )
    .json({
      success:
        false,

      message:
        "Internal Server Error",

      errors:
        [],
    });
};