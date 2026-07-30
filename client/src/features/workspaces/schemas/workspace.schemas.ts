import { z } from "zod";

export const WORKSPACE_AVATAR_MAX_SIZE = 5 * 1024 * 1024;

export const WORKSPACE_AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";

const ALLOWED_WORKSPACE_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

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
    .optional()
    .or(z.literal("")),
});

export type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>;

export const editWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Workspace name must be at least 3 characters.")
    .max(100, "Workspace name cannot exceed 100 characters."),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
  timezone: z.string().trim().min(1, "Timezone cannot be empty."),
});

export type EditWorkspaceFormValues = z.infer<typeof editWorkspaceSchema>;

export const workspaceAvatarFormSchema = z
  .object({
    file: z
      .custom<File>(
        (value) => typeof File !== "undefined" && value instanceof File,
        {
          message: "Choose a workspace avatar image.",
        },
      )
      .refine((file) => ALLOWED_WORKSPACE_AVATAR_TYPES.has(file.type), {
        message: "Workspace avatar must be a JPEG, PNG, or WebP image.",
      })
      .refine((file) => file.size > 0, {
        message: "Workspace avatar image cannot be empty.",
      })
      .refine((file) => file.size <= WORKSPACE_AVATAR_MAX_SIZE, {
        message: "Workspace avatar image must be 5 MB or smaller.",
      }),
  })
  .strict();
