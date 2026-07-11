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
        .optional(),
});

export const updateProjectSchema = z.object({
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
        .max(10, "Icon cannot exceed 10 characters.")
        .optional(),
});

export const projectIdSchema = z.object({
    projectId: z.string().length(24, "Invalid project id"),
});