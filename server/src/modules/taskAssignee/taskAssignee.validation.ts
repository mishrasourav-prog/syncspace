import { z } from "zod";

import { objectIdSchema } from "../../validators/common.validation";

export const assignTaskAssigneeSchema = z
  .object({
    userId: objectIdSchema,
  })
  .strict();

export const taskAssigneeTaskParamsSchema = z
  .object({
    taskId: objectIdSchema,
  })
  .strict();

export const taskAssigneeParamsSchema = z
  .object({
    taskId: objectIdSchema,

    userId: objectIdSchema,
  })
  .strict();
