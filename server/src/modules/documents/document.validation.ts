import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID.");

const booleanQuerySchema = z.preprocess((value) => {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}, z.boolean());

export const projectIdParamSchema = z.object({
  projectId: objectIdSchema,
});

export const documentIdParamSchema = z.object({
  documentId: objectIdSchema,
});

export const createProjectDocumentBodySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Document title is required.")
    .max(200, "Document title cannot exceed 200 characters."),

  content: z.unknown().optional(),
});

export const updateProjectDocumentBodySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Document title cannot be empty.")
      .max(200, "Document title cannot exceed 200 characters.")
      .optional(),

    content: z.unknown().nullable().optional(),

    expectedRevision: z.number().int().positive(),
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: "At least one document field must be updated.",
  });

export const getProjectDocumentsQuerySchema = z.object({
  isArchived: booleanQuerySchema.optional(),

  search: z.string().trim().min(1).max(100).optional(),

  cursor: objectIdSchema.optional(),

  limit: z.coerce.number().int().min(1).max(50).default(20),
});
