import { z } from "zod";
import { objectIdSchema } from "../../validators/common.validation";

export const taskAssignmentRequestTaskParamsSchema = z
  .object({ taskId: objectIdSchema })
  .strict();

export const taskAssignmentRequestParamsSchema = z
  .object({
    taskId: objectIdSchema,
    requestId: objectIdSchema,
  })
  .strict();
