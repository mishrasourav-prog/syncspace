import { z } from "zod";

import {
    objectIdSchema,
} from "../../validators/common.validation";

/*
|--------------------------------------------------------------------------
| Assign User Body
|--------------------------------------------------------------------------
*/

export const assignTaskAssigneeSchema =
    z.object({
        userId: objectIdSchema,
    })
    .strict();

/*
|--------------------------------------------------------------------------
| Task Route Parameters
|--------------------------------------------------------------------------
*/

export const taskAssigneeTaskParamsSchema =
    z.object({
        taskId: objectIdSchema,
    })
    .strict();

/*
|--------------------------------------------------------------------------
| Remove Assignee Route Parameters
|--------------------------------------------------------------------------
*/

export const taskAssigneeParamsSchema =
    z.object({
        taskId: objectIdSchema,

        /*
        This is the assigned user's ID,
        not the TaskAssignee document ID.
        */
        userId: objectIdSchema,
    })
    .strict();