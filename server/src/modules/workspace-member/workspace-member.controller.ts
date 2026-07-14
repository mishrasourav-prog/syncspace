import {
    Request,
    Response,
    NextFunction,
} from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import WorkspaceMemberServices
    from "./workspace-member.service";

import {
    updateWorkspaceMemberRoleSchema,
    workspaceMemberParamsSchema,
    workspaceMemberWorkspaceParamsSchema,
} from "./workspace-member.validation";

/*
|--------------------------------------------------------------------------
| Get Workspace Members
|--------------------------------------------------------------------------
*/

export const getWorkspaceMembers = async (
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
            workspaceMemberWorkspaceParamsSchema.parse(
                req.params
            );

        const members =
            await WorkspaceMemberServices.getWorkspaceMembers(
                workspaceId,
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Workspace members fetched successfully.",
                members
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Update Workspace Member Role
|--------------------------------------------------------------------------
*/

export const updateMemberRole = async (
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
            workspaceId,
            memberId,
        } = workspaceMemberParamsSchema.parse(
            req.params
        );

        const { role } =
            updateWorkspaceMemberRoleSchema.parse(
                req.body
            );

        const member =
            await WorkspaceMemberServices.updateMemberRole(
                workspaceId,
                memberId,
                req.user._id,
                role
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Member role updated successfully.",
                member
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Remove Workspace Member
|--------------------------------------------------------------------------
*/

export const removeMember = async (
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
            workspaceId,
            memberId,
        } = workspaceMemberParamsSchema.parse(
            req.params
        );

        await WorkspaceMemberServices.removeMember(
            workspaceId,
            memberId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Member removed successfully."
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Leave Workspace
|--------------------------------------------------------------------------
*/

export const leaveWorkspace = async (
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
            workspaceMemberWorkspaceParamsSchema.parse(
                req.params
            );

        await WorkspaceMemberServices.leaveWorkspace(
            workspaceId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Left workspace successfully."
            )
        );
    } catch (error) {
        return next(error);
    }
};