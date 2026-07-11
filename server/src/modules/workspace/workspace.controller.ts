import { Request , Response , NextFunction } from "express";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import { createWorkspaceSchema , workspaceIdSchema , updateWorkspaceSchema } from "./workspace.validation";
import WorkspaceService from "./workspace.service";
export const createWorkspace = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        if (!req.user) {
            throw new ApiError(401, "Unauthorized");
        }

        const result = createWorkspaceSchema.safeParse(req.body);

        if (!result.success) {
            throw new ApiError(400, result.error.message);
        }

        const workspace =
            await WorkspaceService.createWorkspace(
                req.user._id,         
                result.data
            );

        return res.status(201).json(
            new ApiResponse(
                201,
                "Workspace created successfully.",
                workspace
            )
        );

    } catch (error) {
        next(error);
    }
};


export const getUserWorkspaces = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        if (!req.user) {
            throw new ApiError(
                401,
                "Unauthorized"
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
        next(error);
    }
};

export const getWorkspace = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        if (!req.user) {
            throw new ApiError(
                401,
                "Unauthorized"
            );
        }

        const result =
            workspaceIdSchema.safeParse(req.params);

        if (!result.success) {
            throw new ApiError(
                400,
                result.error.message
            );
        }

        const payload =
            await WorkspaceService.getWorkspace(
                result.data.workspaceId,
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Workspace fetched successfully.",
                payload
            )
        );

    } catch (error) {
        next(error);
    }

};

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

        const params =
            workspaceIdSchema.safeParse(req.params);

        if (!params.success) {
            throw new ApiError(
                400,
                params.error.message
            );
        }

        const body =
            updateWorkspaceSchema.safeParse(req.body);

        if (!body.success) {
            throw new ApiError(
                400,
                body.error.message
            );
        }

        const payload =
            await WorkspaceService.updateWorkspace(
                params.data.workspaceId,
                req.user._id,
                body.data
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Workspace updated successfully.",
                payload
            )
        );

    } catch (error) {
        next(error);
    }

};

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

        const result =
            workspaceIdSchema.safeParse(req.params);

        if (!result.success) {
            throw new ApiError(
                400,
                result.error.message
            );
        }

        await WorkspaceService.archiveWorkspace(
            result.data.workspaceId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Workspace archived successfully."
            )
        );

    } catch (error) {
        next(error);
    }

};


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

        const result =
            workspaceIdSchema.safeParse(req.params);

        if (!result.success) {
            throw new ApiError(
                400,
                result.error.message
            );
        }

        await WorkspaceService.restoreWorkspace(
            result.data.workspaceId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Workspace restored successfully."
            )
        );

    } catch (error) {
        next(error);
    }

};

// export const getArchivedWorkspaces = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {

//     try {

//         if (!req.user) {
//             throw new ApiError(
//                 401,
//                 "Unauthorized."
//             );
//         }

//         const payload =
//             await WorkspaceService.getArchivedWorkspaces(
//                 req.user._id
//             );

//         return res.status(200).json(
//             new ApiResponse(
//                 200,
//                 "Archived workspaces fetched successfully.",
//                 payload
//             )
//         );

//     } catch (error) {
//         next(error);
//     }

// };