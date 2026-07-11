import { Request, Response, NextFunction } from "express";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import  ProjectMemberService from "./projectMember.service";
import { updateProjectMemberRoleSchema , projectMemberIdSchema } from "./projectMember.validation";
import {projectIdSchema} from "../project/project.validation";

export const getProjectMembers = async (
    req: Request<{ projectId: string }>,
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
            await ProjectMemberService.getProjectMembers(
                req.params.projectId,
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Project members fetched successfully.",
                members
            )
        );

    } catch (error) {
        next(error);
    }
};

export const updateMemberRole = async (
    req: Request<{ projectId: string; memberId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {

        if (!req.user) {
            throw new ApiError(401, "Unauthorized.");
        }

        const result =
            updateProjectMemberRoleSchema.safeParse(
                req.body
            );

        if (!result.success) {
            throw new ApiError(
                400,
                result.error.message
            );
        }

        const params = projectMemberIdSchema.safeParse(req.params);

if (!params.success) {
    throw new ApiError(
        400,
        params.error.message
    );
}

        const member =
            await ProjectMemberService.updateMemberRole(
                params.data.projectId,
                params.data.memberId,
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
    req: Request<{ projectId: string; memberId: string }>,
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
            projectMemberIdSchema.safeParse(req.params);

        if (!params.success) {
            throw new ApiError(
                400,
                params.error.message
            );
        }

        await ProjectMemberService.removeMember(
            params.data.projectId,
            params.data.memberId,
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

export const leaveProject = async (
    req: Request<{ projectId: string }>,
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

        await ProjectMemberService.leaveProject(
            params.data.projectId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Left project successfully."
            )
        );

    } catch (error) {
        next(error);
    }

};