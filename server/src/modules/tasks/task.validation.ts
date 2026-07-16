import { z } from "zod";

import {
    objectIdSchema,
} from "../../validators/common.validation";

import {
    TaskPriority,
    TaskStatus,
} from "./task.model";

import { TaskType } from "./task.model";

import { IReorderProjectTasksInput } from "../../interfaces/task.interface";



export const taskStatusSchema:
    z.ZodType<TaskStatus> =
        z.enum(
            TaskStatus
        );



/*
|--------------------------------------------------------------------------
| Create Task
|--------------------------------------------------------------------------
*/
export const taskTypeSchema =
    z.enum([
        TaskType.TASK,
        TaskType.ISSUE,
    ]);

export const createTaskSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(
                1,
                "Title is required."
            )
            .max(
                200,
                "Title cannot exceed 200 characters."
            ),

        description: z
            .string()
            .trim()
            .max(
                10000,
                "Description cannot exceed 10000 characters."
            )
            .optional(),

        type:
            taskTypeSchema
                .optional(),

        priority: z
            .enum(TaskPriority)
            .optional(),

        startDate: z
            .coerce
            .date()
            .optional(),

        dueDate: z
            .coerce
            .date()
            .optional(),

        parentTask:
            objectIdSchema.optional(),
    })
    .strict()
    .superRefine(
        (data, context) => {
            if (
                data.startDate &&
                data.dueDate &&
                data.startDate >
                    data.dueDate
            ) {
                context.addIssue({
                    code:
                        z.ZodIssueCode.custom,

                    path: [
                        "dueDate",
                    ],

                    message:
                        "Due date cannot be before start date.",
                });
            }
        }
    );

/*
|--------------------------------------------------------------------------
| Update Task
|--------------------------------------------------------------------------
|
| Status remains here temporarily.
| It will move to the dedicated task-status endpoint later.
|
*/

export const updateTaskSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(
                1,
                "Title cannot be empty."
            )
            .max(
                200,
                "Title cannot exceed 200 characters."
            )
            .optional(),

        description: z
            .string()
            .trim()
            .max(
                10000,
                "Description cannot exceed 10000 characters."
            )
            .optional(),

        priority: z
            .enum(TaskPriority)
            .optional(),

        type:
            taskTypeSchema
                .optional(),

        startDate: z
            .coerce
            .date()
            .optional(),

        dueDate: z
            .coerce
            .date()
            .optional(),

        parentTask:
            objectIdSchema.optional(),
    })
    .strict()
    .refine(
        (data) =>
            Object.keys(data).length >
            0,
        {
            message:
                "At least one task field must be provided.",
        }
    )
    .superRefine(
        (data, context) => {
            /*
            This catches invalid dates when both are supplied
            in the same request.

            The service still compares a supplied date against
            the existing stored date when only one is supplied.
            */

            if (
                data.startDate &&
                data.dueDate &&
                data.startDate >
                    data.dueDate
            ) {
                context.addIssue({
                    code:
                        z.ZodIssueCode.custom,

                    path: [
                        "dueDate",
                    ],

                    message:
                        "Due date cannot be before start date.",
                });
            }
        }
    );

/*
|--------------------------------------------------------------------------
| Task Route Parameters
|--------------------------------------------------------------------------
*/

export const taskIdParamSchema =
    z.object({
        taskId: objectIdSchema,
    })
    .strict();


export const updateTaskStatusSchema =
    z.object({
        status: z.enum(
            TaskStatus
        ),
    });

export const reorderProjectTasksBodySchema:
    z.ZodType<IReorderProjectTasksInput> =
        z.object({
            columns:
                z.array(
                    z.object({
                        status:
                            taskStatusSchema,

                        taskIds:
                            z.array(
                                objectIdSchema
                            )
                                .max(
                                    500,
                                    "A maximum of 500 tasks can be reordered at once."
                                ),
                    })
                )
                    .min(
                        1,
                        "At least one column is required."
                    )
                    .max(
                        Object.values(
                            TaskStatus
                        ).length
                    ),
        })
            .superRefine(
                (
                    data,
                    context
                ) => {
                    const statuses =
                        new Set<TaskStatus>();

                    const taskIds =
                        new Set<string>();

                    data.columns.forEach(
                        (
                            column,
                            columnIndex
                        ) => {
                            if (
                                statuses.has(
                                    column.status
                                )
                            ) {
                                context.addIssue({
                                    code:
                                        "custom",

                                    path: [
                                        "columns",
                                        columnIndex,
                                        "status",
                                    ],

                                    message:
                                        "The same status column cannot be provided more than once.",
                                });
                            }

                            statuses.add(
                                column.status
                            );

                            column.taskIds.forEach(
                                (
                                    taskId,
                                    taskIndex
                                ) => {
                                    if (
                                        taskIds.has(
                                            taskId
                                        )
                                    ) {
                                        context.addIssue({
                                            code:
                                                "custom",

                                            path: [
                                                "columns",
                                                columnIndex,
                                                "taskIds",
                                                taskIndex,
                                            ],

                                            message:
                                                "A task cannot appear more than once.",
                                        });
                                    }

                                    taskIds.add(
                                        taskId
                                    );
                                }
                            );
                        }
                    );
                }
            );