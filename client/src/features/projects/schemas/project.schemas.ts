import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters.")
    .max(100, "Project name cannot exceed 100 characters."),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
  icon: z
    .string()
    .trim()
    .max(10, "Icon cannot exceed 10 characters.")
    .optional()
    .or(z.literal("")),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
