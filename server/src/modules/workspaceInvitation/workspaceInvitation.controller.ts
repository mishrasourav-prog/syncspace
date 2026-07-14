import type {
    Request,
    Response,
    NextFunction,
} from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import WorkspaceInvitationService
    from "./workspaceInvitation.service";

import {
    inviteUserSchema,
    workspaceInvitationParamsSchema,
    workspaceInvitationWorkspaceParamsSchema,
} from "./workspaceInvitation.validation";

/*
|--------------------------------------------------------------------------
| Invite User
|--------------------------------------------------------------------------
*/

export const inviteUser = async (
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
            workspaceInvitationWorkspaceParamsSchema.parse(
                req.params
            );

        const data =
            inviteUserSchema.parse(
                req.body
            );

        const invitation =
            await WorkspaceInvitationService.inviteUser(
                workspaceId,
                req.user._id,
                data
            );

        return res.status(201).json(
            new ApiResponse(
                201,
                "Invitation sent successfully.",
                invitation
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Get Current User Invitations
|--------------------------------------------------------------------------
*/

export const getMyInvitations = async (
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

        const invitations =
            await WorkspaceInvitationService.getMyInvitations(
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Invitations fetched successfully.",
                invitations
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Accept Invitation
|--------------------------------------------------------------------------
*/

export const acceptInvitation = async (
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

        const { invitationId } =
            workspaceInvitationParamsSchema.parse(
                req.params
            );

        await WorkspaceInvitationService.acceptInvitation(
            invitationId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Invitation accepted successfully."
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Reject Invitation
|--------------------------------------------------------------------------
*/

export const rejectInvitation = async (
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

        const { invitationId } =
            workspaceInvitationParamsSchema.parse(
                req.params
            );

        await WorkspaceInvitationService.rejectInvitation(
            invitationId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Invitation rejected successfully."
            )
        );
    } catch (error) {
        return next(error);
    }
};