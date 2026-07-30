import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID.");

export const projectIdParamSchema = z.object({
  projectId: objectIdSchema,
});

export const discussionIdParamSchema = z.object({
  discussionId: objectIdSchema,
});

export const replyIdParamSchema = z.object({
  replyId: objectIdSchema,
});

export const createDiscussionBodySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Discussion title is required.")
    .max(200, "Discussion title cannot exceed 200 characters."),

  body: z
    .string()
    .trim()
    .min(1, "Discussion body is required.")
    .max(10_000, "Discussion body cannot exceed 10000 characters."),
});

export const updateDiscussionBodySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Discussion title cannot be empty.")
      .max(200, "Discussion title cannot exceed 200 characters.")
      .optional(),

    body: z
      .string()
      .trim()
      .min(1, "Discussion body cannot be empty.")
      .max(10_000, "Discussion body cannot exceed 10000 characters.")
      .optional(),
  })
  .refine((data) => data.title !== undefined || data.body !== undefined, {
    message: "At least one discussion field must be updated.",
  });

export const createDiscussionReplyBodySchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Reply body is required.")
    .max(5000, "Reply cannot exceed 5000 characters."),
});

export const updateDiscussionReplyBodySchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Reply body cannot be empty.")
    .max(5000, "Reply cannot exceed 5000 characters."),
});

export const getDiscussionsQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),

  cursor: objectIdSchema.optional(),

  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const getDiscussionRepliesQuerySchema = z.object({
  cursor: objectIdSchema.optional(),

  limit: z.coerce.number().int().min(1).max(100).default(30),
});
