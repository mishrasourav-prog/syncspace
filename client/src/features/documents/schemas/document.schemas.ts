import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200, "Title cannot exceed 200 characters."),
});

export type CreateDocumentFormValues = z.infer<typeof createDocumentSchema>;

export const renameDocumentSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200, "Title cannot exceed 200 characters."),
});

export type RenameDocumentFormValues = z.infer<typeof renameDocumentSchema>;
