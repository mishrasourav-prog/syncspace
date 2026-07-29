import type {
    Request,
    Response,
    NextFunction,
} from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import {
    projectIdSchema,
} from "../project/project.validation";

import ProjectInvitationService
    from "./projectInvitation.service";

import {
    createProjectInvitationSchema,
    projectInvitationIdSchema,
} from "./projectInvitation.validation";

/*
|--------------------------------------------------------------------------
| Invite Project Member
|--------------------------------------------------------------------------
*/

export const inviteProjectMember = async (
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

        const { projectId } =
            projectIdSchema.parse(
                req.params
            );

        const data =
            createProjectInvitationSchema.parse(
                req.body
            );

        const invitation =
            await ProjectInvitationService.inviteMember(
                projectId,
                req.user._id,
                data
            );

        return res.status(201).json(
            new ApiResponse(
                201,
                "Project invitation sent successfully.",
                invitation
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Accept Project Invitation
|--------------------------------------------------------------------------
*/

export const acceptProjectInvitation = async (
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
            projectInvitationIdSchema.parse(
                req.params
            );

        await ProjectInvitationService.acceptInvitation(
            invitationId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Project invitation accepted successfully."
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Reject Project Invitation
|--------------------------------------------------------------------------
*/

export const rejectProjectInvitation = async (
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
            projectInvitationIdSchema.parse(
                req.params
            );

        await ProjectInvitationService.rejectInvitation(
            invitationId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Project invitation rejected successfully."
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Cancel Project Invitation
|--------------------------------------------------------------------------
*/

export const cancelProjectInvitation = async (
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
            projectInvitationIdSchema.parse(
                req.params
            );

        await ProjectInvitationService.cancelInvitation(
            invitationId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Project invitation cancelled successfully."
            )
        );
    } catch (error) {
        return next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Get Pending Project Invitations
|--------------------------------------------------------------------------
*/

export const getPendingProjectInvitations =
    async (
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

            const { projectId } =
                projectIdSchema.parse(
                    req.params
                );

            const payload =
                await ProjectInvitationService.getPendingInvitations(
                    projectId,
                    req.user._id
                );

            return res.status(200).json(
                new ApiResponse(
                    200,
                    "Project invitations fetched successfully.",
                    payload
                )
            );
        } catch (error) {
            return next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get Current User Project Invitations
|--------------------------------------------------------------------------
*/

export const getMyProjectInvitations = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized.");
        }

        const payload = await ProjectInvitationService.getMyInvitations(
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Project invitations fetched successfully.",
                payload
            )
        );
    } catch (error) {
        return next(error);
    }
};
