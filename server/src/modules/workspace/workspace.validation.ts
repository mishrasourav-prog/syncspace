import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Workspace name must be at least 3 characters.")
    .max(100, "Workspace name cannot exceed 100 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional(),

  timezone: z
    .string()
    .trim()
    .default("Asia/Kolkata"),
});

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3)
    .max(100)
    .optional(),

  description: z
    .string()
    .trim()
    .max(500)
    .optional(),

  avatar: z
    .string()
    .url("Invalid avatar URL.")
    .optional(),

  timezone: z
    .string()
    .trim()
    .optional(),
});

export const workspaceIdSchema = z.object({
    workspaceId: z.string().length(24, "Invalid workspace id"),
});