import {
    Request,
    Response,
    NextFunction,
} from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import WorkspaceService from "./workspace.service";

import {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    workspaceIdSchema,
} from "./workspace.validation";

/*
|--------------------------------------------------------------------------
| Create Workspace
|--------------------------------------------------------------------------
*/

export const createWorkspace = async (
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

        const data =
            createWorkspaceSchema.parse(
                req.body
            );

        const workspace =
            await WorkspaceService.createWorkspace(
                req.user._id,
                data
            );

        return res.status(201).json(
            new ApiResponse(
                201,
                "Workspace created successfully.",
                workspace
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Get User Workspaces
|--------------------------------------------------------------------------
*/

export const getUserWorkspaces = async (
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

        const workspaces =
            await WorkspaceService.getUserWorkspaces(
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Workspaces fetched successfully.",
                {
                    workspaces,
                }
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Get Workspace
|--------------------------------------------------------------------------
*/

export const getWorkspace = async (
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

        const { workspaceId } =
            workspaceIdSchema.parse(
                req.params
            );

        const workspace =
            await WorkspaceService.getWorkspace(
                workspaceId,
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Workspace fetched successfully.",
                workspace
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Update Workspace
|--------------------------------------------------------------------------
*/

export const updateWorkspace = async (
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

        const { workspaceId } =
            workspaceIdSchema.parse(
                req.params
            );

        const data =
            updateWorkspaceSchema.parse(
                req.body
            );

        const workspace =
            await WorkspaceService.updateWorkspace(
                workspaceId,
                req.user._id,
                data
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Workspace updated successfully.",
                workspace
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Archive Workspace
|--------------------------------------------------------------------------
*/

export const archiveWorkspace = async (
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

        const { workspaceId } =
            workspaceIdSchema.parse(
                req.params
            );

        await WorkspaceService.archiveWorkspace(
            workspaceId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Workspace archived successfully."
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Restore Workspace
|--------------------------------------------------------------------------
*/

export const restoreWorkspace = async (
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

        const { workspaceId } =
            workspaceIdSchema.parse(
                req.params
            );

        await WorkspaceService.restoreWorkspace(
            workspaceId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Workspace restored successfully."
            )
        );
    } catch (error) {
        return next(error);
    }
};