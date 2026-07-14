import type {
    Request,
    Response,
    NextFunction,
} from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import TaskAssigneeService
    from "./taskAssignee.service";

import {
    assignTaskAssigneeSchema,
    taskAssigneeParamsSchema,
    taskAssigneeTaskParamsSchema,
} from "./taskAssignee.validation";



/*
|--------------------------------------------------------------------------
| Assign Member
|--------------------------------------------------------------------------
*/

export const assignMember = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new ApiError(
                401,
                "Unauthorized."
            );
        }

        const { taskId } =
            taskAssigneeTaskParamsSchema.parse(
                req.params
            );

        const { userId } =
            assignTaskAssigneeSchema.parse(
                req.body
            );

        const assignee =
            await TaskAssigneeService.assignMember(
                taskId,

                /*
                User performing the action.
                */
                req.user._id,

                /*
                User being assigned.
                */
                userId
            );

        return res.status(201).json(
            new ApiResponse(
                201,
                "Member assigned successfully.",
                assignee
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Get Task Assignees
|--------------------------------------------------------------------------
*/

export const getTaskAssignees = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new ApiError(
                401,
                "Unauthorized."
            );
        }

        const { taskId } =
            taskAssigneeTaskParamsSchema.parse(
                req.params
            );

        const assignees =
            await TaskAssigneeService.getTaskAssignees(
                taskId,
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Task assignees fetched successfully.",
                assignees
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Remove Assignee
|--------------------------------------------------------------------------
*/

export const removeAssignee = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new ApiError(
                401,
                "Unauthorized."
            );
        }

        const {
            taskId,
            userId,
        } = taskAssigneeParamsSchema.parse(
            req.params
        );

        await TaskAssigneeService.removeAssignee(
            taskId,

            /*
            User being unassigned.
            */
            userId,

            /*
            User performing the action.
            */
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Member unassigned successfully."
            )
        );
    } catch (error) {
        return next(error);
    }
};