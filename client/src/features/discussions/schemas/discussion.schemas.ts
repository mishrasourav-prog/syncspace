import { z } from "zod";

export const createDiscussionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(200, "Title cannot exceed 200 characters."),
  body: z
    .string()
    .trim()
    .min(1, "Discussion message is required.")
    .max(10_000, "Discussion message cannot exceed 10,000 characters."),
});

export type CreateDiscussionFormValues = z.infer<typeof createDiscussionSchema>;

export const editDiscussionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(200, "Title cannot exceed 200 characters."),
  body: z
    .string()
    .trim()
    .min(1, "Discussion message is required.")
    .max(10_000, "Discussion message cannot exceed 10,000 characters."),
});

export type EditDiscussionFormValues = z.infer<typeof editDiscussionSchema>;

export const replyBodySchema = z
  .string()
  .trim()
  .min(1, "Reply cannot be empty.")
  .max(5000, "Reply cannot exceed 5,000 characters.");
