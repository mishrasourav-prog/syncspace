import { z } from "zod";

import {
    objectIdSchema,
} from "../../validators/common.validation";

export const createWorkspaceSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(
                3,
                "Workspace name must be at least 3 characters."
            )
            .max(
                100,
                "Workspace name cannot exceed 100 characters."
            ),

        description: z
            .string()
            .trim()
            .max(
                500,
                "Description cannot exceed 500 characters."
            )
            .optional(),

        timezone: z
            .string()
            .trim()
            .min(
                1,
                "Timezone cannot be empty."
            )
            .default("Asia/Kolkata"),
    })
    .strict();

export const updateWorkspaceSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(
                3,
                "Workspace name must be at least 3 characters."
            )
            .max(
                100,
                "Workspace name cannot exceed 100 characters."
            )
            .optional(),

        description: z
            .string()
            .trim()
            .max(
                500,
                "Description cannot exceed 500 characters."
            )
            .optional(),

        avatar: z
            .string()
            .url(
                "Invalid avatar URL."
            )
            .optional(),

        timezone: z
            .string()
            .trim()
            .min(
                1,
                "Timezone cannot be empty."
            )
            .optional(),
    })
    .strict()
    .refine(
        (data) =>
            Object.keys(data).length > 0,
        {
            message:
                "At least one workspace field must be provided.",
        }
    );

export const workspaceIdSchema = z
    .object({
        workspaceId:
            objectIdSchema,
    })
    .strict();