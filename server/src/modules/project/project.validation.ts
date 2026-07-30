import { z } from "zod";

import { objectIdSchema } from "../../validators/common.validation";

export const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Project name must be at least 2 characters.")
      .max(100, "Project name cannot exceed 100 characters."),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters.")
      .optional(),

    icon: z
      .string()
      .trim()
      .min(1, "Project icon cannot be empty.")
      .max(10, "Project icon cannot exceed 10 characters.")
      .optional(),
  })
  .strict();

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Project name must be at least 2 characters.")
      .max(100, "Project name cannot exceed 100 characters.")
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters.")
      .optional(),

    icon: z
      .string()
      .trim()
      .min(1, "Project icon cannot be empty.")
      .max(10, "Project icon cannot exceed 10 characters.")
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one project field must be provided.",
  });

export const projectIdSchema = z
  .object({
    projectId: objectIdSchema,
  })
  .strict();
