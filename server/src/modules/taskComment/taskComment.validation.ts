import { z } from "zod";

import {
    cursorSchema,
    objectIdSchema,
} from "../../validators/common.validation";

/*
|--------------------------------------------------------------------------
| Request Body Validation
|--------------------------------------------------------------------------
*/

export const createTaskCommentSchema = z
    .object({
        body: z
            .string({
                error: "Comment body is required.",
            })
            .trim()
            .min(
                1,
                "Comment cannot be empty."
            )
            .max(
                10000,
                "Comment cannot exceed 10000 characters."
            ),
    })
    .strict();

export const updateTaskCommentSchema = z
    .object({
        body: z
            .string({
                error: "Comment body is required.",
            })
            .trim()
            .min(
                1,
                "Comment cannot be empty."
            )
            .max(
                10000,
                "Comment cannot exceed 10000 characters."
            ),
    })
    .strict();

/*
|--------------------------------------------------------------------------
| Route Parameter Validation
|--------------------------------------------------------------------------
*/

export const taskCommentTaskParamsSchema = z
    .object({
        taskId: objectIdSchema,
    })
    .strict();

export const taskCommentParamsSchema = z
    .object({
        commentId: objectIdSchema,
    })
    .strict();

/*
|--------------------------------------------------------------------------
| Query Validation
|--------------------------------------------------------------------------
*/

export const getTaskCommentsQuerySchema = z
    .object({
        cursor: cursorSchema.optional(),

        limit: z.coerce
            .number({
                error: "Limit must be a number.",
            })
            .int(
                "Limit must be an integer."
            )
            .min(
                1,
                "Limit must be at least 1."
            )
            .max(
                100,
                "Limit cannot exceed 100."
            )
            .default(25),
    })
    .strict();