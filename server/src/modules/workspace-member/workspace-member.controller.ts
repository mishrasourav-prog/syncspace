import { Request, Response, NextFunction } from "express";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import WorkspaceMemberServices from "./workspace-member.service";
import { updateWorkspaceMemberRoleSchema } from "./workspace-member.validation";


export const getWorkspaceMembers = async (
    req: Request<{ workspaceId: string }>,
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

        const members =
            await WorkspaceMemberServices.getWorkspaceMembers(
                req.params.workspaceId,
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
        next(error);
    }
};

export const updateMemberRole = async (
    req: Request<{ workspaceId: string; memberId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {

        if (!req.user) {
            throw new ApiError(401, "Unauthorized.");
        }

        const result =
            updateWorkspaceMemberRoleSchema.safeParse(
                req.body
            );

        if (!result.success) {
            throw new ApiError(
                400,
                result.error.message
            );
        }

        const member =
            await WorkspaceMemberServices.updateMemberRole(
                req.params.workspaceId,
                req.params.memberId,
                req.user._id,
                result.data.role
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Member role updated successfully.",
                member
            )
        );

    } catch (error) {
        next(error);
    }
};

export const removeMember = async (
    req: Request<{
        workspaceId: string;
        memberId: string;
    }>,
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

        await WorkspaceMemberServices.removeMember(
            req.params.workspaceId,
            req.params.memberId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Member removed successfully."
            )
        );

    } catch (error) {
        next(error);
    }
};

export const leaveWorkspace = async (
    req: Request<{ workspaceId: string }>,
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

        await WorkspaceMemberServices.leaveWorkspace(
            req.params.workspaceId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Left workspace successfully."
            )
        );

    } catch (error) {
        next(error);
    }
};