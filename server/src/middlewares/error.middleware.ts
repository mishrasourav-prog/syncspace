import {
    Request,
    Response,
    NextFunction,
} from "express";

import mongoose from "mongoose";
import { ZodError } from "zod";

import ApiError from "../utils/ApiError";

/*
|--------------------------------------------------------------------------
| MongoDB Duplicate-Key Error Type
|--------------------------------------------------------------------------
*/

interface IMongoDuplicateKeyError {
    code: number;

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
): error is IMongoDuplicateKeyError => {
    if (
        typeof error !== "object" ||
        error === null
    ) {
        return false;
    }

    return (
        "code" in error &&
        (error as {
            code?: unknown;
        }).code === 11000
    );
};

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let error = err;

    /*
    |--------------------------------------------------------------------------
    | Optimistic Concurrency Conflict
    |--------------------------------------------------------------------------
    */

    if (
        err instanceof
        mongoose.Error.VersionError
    ) {
        error = new ApiError(
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
        isMongoDuplicateKeyError(err)
    ) {
        const duplicateFields =
            Object.keys(
                err.keyPattern ??
                err.keyValue ??
                {}
            );

        const formattedFields =
            duplicateFields.length > 0
                ? duplicateFields.join(", ")
                : "unique fields";

        error = new ApiError(
            409,
            `A record with the same ${formattedFields} already exists.`
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Mongoose Validation Error
    |--------------------------------------------------------------------------
    */

    else if (
        err instanceof
        mongoose.Error.ValidationError
    ) {
        const messages =
            Object.values(
                err.errors
            ).map(
                (validationError) =>
                    validationError.message
            );

        error = new ApiError(
            400,
            messages.join(" ")
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Mongoose Cast Error
    |--------------------------------------------------------------------------
    */

    else if (
        err instanceof
        mongoose.Error.CastError
    ) {
        error = new ApiError(
            400,
            `Invalid value for ${err.path}.`
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Zod Validation Error
    |--------------------------------------------------------------------------
    */

    else if (
        err instanceof ZodError
    ) {
        const validationErrors =
            err.issues.map(
                (issue) => ({
                    field:
                        issue.path.join(
                            "."
                        ) ||
                        "request",

                    message:
                        issue.message,
                })
            );

        error = new ApiError(
            400,
            "Validation failed.",
            validationErrors
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Known Application Error
    |--------------------------------------------------------------------------
    */

    if (error instanceof ApiError) {
        return res
            .status(error.statusCode)
            .json({
                success: false,

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
    */

    console.error(
        "Unhandled application error:",
        err
    );

    return res
        .status(500)
        .json({
            success: false,

            message:
                "Internal Server Error",

            errors: [],
        });
};