import { Request , Response , NextFunction } from "express";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import { projectIdSchema } from "../project/project.validation";
import { createProjectInvitationSchema } from "./projectInvitation.validation";
import ProjectInvitationService from "./projectInvitation.service";
import { projectInvitationIdSchema } from "./projectInvitation.validation";

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

        const params =
            projectIdSchema.safeParse(req.params);

        if (!params.success) {
            throw new ApiError(
                400,
                params.error.message
            );
        }

        const body =
            createProjectInvitationSchema.safeParse(
                req.body
            );

        if (!body.success) {
            throw new ApiError(
                400,
                body.error.message
            );
        }

        const invitation =
            await ProjectInvitationService.inviteMember(
                params.data.projectId,
                req.user._id,
                body.data
            );

        return res.status(201).json(
            new ApiResponse(
                201,
                "Project invitation sent successfully.",
                invitation
            )
        );

    } catch (error) {

        next(error);

    }

};

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

        const params =
            projectInvitationIdSchema.safeParse(
                req.params
            );

        if (!params.success) {
            throw new ApiError(
                400,
                params.error.message
            );
        }

        await ProjectInvitationService.acceptInvitation(
            params.data.invitationId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Project invitation accepted successfully."
            )
        );

    } catch (error) {
        next(error);
    }

};

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

        const params =
            projectInvitationIdSchema.safeParse(
                req.params
            );

        if (!params.success) {
            throw new ApiError(
                400,
                params.error.message
            );
        }

        await ProjectInvitationService.rejectInvitation(
            params.data.invitationId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Project invitation rejected successfully."
            )
        );

    } catch (error) {
        next(error);
    }

};

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

        const params =
            projectInvitationIdSchema.safeParse(
                req.params
            );

        if (!params.success) {
            throw new ApiError(
                400,
                params.error.message
            );
        }

        await ProjectInvitationService.cancelInvitation(
            params.data.invitationId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Project invitation cancelled successfully."
            )
        );

    } catch (error) {
        next(error);
    }

};


export const getPendingProjectInvitations = async (
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
            projectIdSchema.safeParse(req.params);

        if (!params.success) {
            throw new ApiError(
                400,
                params.error.message
            );
        }

        const payload =
            await ProjectInvitationService.getPendingInvitations(
                params.data.projectId,
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
        next(error);
    }

};