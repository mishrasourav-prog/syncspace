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
  avatar: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  timezone: z.string().trim().min(1, "Timezone cannot be empty."),
});

export type EditWorkspaceFormValues = z.infer<typeof editWorkspaceSchema>;
