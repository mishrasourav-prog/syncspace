import { Request, Response, NextFunction } from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import WorkspaceInvitationService from "./workspaceInvitation.service";

import {
    inviteUserSchema,
} from "./workspaceInvitation.validation";


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

        const result =
            inviteUserSchema.safeParse(req.body);

        if (!result.success) {
            throw new ApiError(
                400,
                result.error.message
            );
        }

        const invitation =
            await WorkspaceInvitationService.inviteUser(
                req.params.workspaceId as string,
                req.user._id,
                result.data
            );

        return res.status(201).json(
            new ApiResponse(
                201,
                "Invitation sent successfully.",
                invitation
            )
        );

    } catch (error) {
        next(error);
    }
};

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
        next(error);
    }
};

export const acceptInvitation = async (
    req: Request<{ invitationId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {

        if (!req.user) {
            throw new ApiError(401, "Unauthorized.");
        }

        await WorkspaceInvitationService.acceptInvitation(
            req.params.invitationId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Invitation accepted successfully."
            )
        );

    } catch (error) {
        next(error);
    }
};

export const rejectInvitation = async (
    req: Request<{ invitationId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {

        if (!req.user) {
            throw new ApiError(401, "Unauthorized.");
        }

        await WorkspaceInvitationService.rejectInvitation(
            req.params.invitationId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Invitation rejected successfully."
            )
        );

    } catch (error) {
        next(error);
    }
};