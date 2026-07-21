import { z } from "zod";

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(200, "Title cannot exceed 200 characters."),
    description: z.string().trim().max(10000, "Description cannot exceed 10000 characters.").optional().or(z.literal("")),
    type: z.enum(["task", "issue"]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    startDate: z.string().optional().or(z.literal("")),
    dueDate: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.dueDate && new Date(data.startDate) > new Date(data.dueDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueDate"],
        message: "Due date cannot be before start date.",
      });
    }
  });

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
