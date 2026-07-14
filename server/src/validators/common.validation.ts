import { z } from "zod";

/*
|--------------------------------------------------------------------------
| MongoDB ObjectId
|--------------------------------------------------------------------------
*/

const objectIdRegex = /^[a-f\d]{24}$/i;

export const objectIdSchema = z
    .string()
    .trim()
    .regex(
        objectIdRegex,
        "Invalid identifier."
    );

/*
|--------------------------------------------------------------------------
| Cursor
|--------------------------------------------------------------------------
|
| Cursors will be Base64 URL-safe encoded strings.
| The service will decode and validate their internal payload.
|
*/

export const cursorSchema = z
    .string()
    .trim()
    .min(
        1,
        "Cursor cannot be empty."
    )
    .max(
        512,
        "Cursor is invalid."
    )
    .regex(
        /^[A-Za-z0-9_-]+$/,
        "Cursor is invalid."
    );