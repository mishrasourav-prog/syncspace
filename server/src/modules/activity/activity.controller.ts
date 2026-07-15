import type {
    NextFunction,
    Request,
    Response,
} from "express";

import ApiResponse from "../../utils/ApiResponse";

import {
    objectIdSchema,
} from "../../validators/common.validation";

import activityService from "./activity.service";

export const getProjectActivities =
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const projectId =
                objectIdSchema.parse(
                    req.params.projectId
                );

            const result =
                await activityService
                    .getProjectActivities(
                        projectId,
                        req.user!._id
                    );

            res.status(200).json(
                new ApiResponse(
                    200,
                    "Project activities fetched successfully.",
                    result
                )
            );
        } catch (error) {
            return next(
                error
            );
        }
    };

export const getWorkspaceActivities =
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const workspaceId =
                objectIdSchema.parse(
                    req.params.workspaceId
                );

            const result =
                await activityService
                    .getWorkspaceActivities(
                        workspaceId,
                        req.user!._id
                    );

            res.status(200).json(
                new ApiResponse(
                    200,
                    "Workspace activities fetched successfully.",
                    result
                )
            );
        } catch (error) {
            return next(
                error
            );
        }
    };