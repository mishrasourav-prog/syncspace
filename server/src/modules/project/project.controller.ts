import { Request, Response, NextFunction } from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import  ProjectService  from "./project.service";
import { projectIdSchema } from "./project.validation";
import {
    createProjectSchema,
} from "./project.validation";

import { workspaceIdSchema } from "../workspace/workspace.validation";
import { updateProjectSchema } from "./project.validation";

export const createProject = async (
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
            createProjectSchema.safeParse(req.body);

        if (!body.success) {
            throw new ApiError(
                400,
                body.error.message
            );
        }

        const project =
            await ProjectService.createProject(
                params.data.workspaceId,
                req.user._id,
                body.data
            );

        return res.status(201).json(
            new ApiResponse(
                201,
                "Project created successfully.",
                project
            )
        );

    } catch (error) {
        next(error);
    }

};


export const getWorkspaceProjects = async (
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

        const params =
            workspaceIdSchema.safeParse(req.params);

        if (!params.success) {
            throw new ApiError(
                400,
                params.error.message
            );
        }

        const projects =
            await ProjectService.getWorkspaceProjects(
                params.data.workspaceId,
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Projects fetched successfully.",
                projects
            )
        );

    } catch (error) {
        next(error);
    }

};


export const getProject = async (
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

        const project =
            await ProjectService.getProject(
                params.data.projectId,
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Project fetched successfully.",
                project
            )
        );

    } catch (error) {
        next(error);
    }

};

export const updateProject = async (
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

        const body =
            updateProjectSchema.safeParse(req.body);

        if (!body.success) {
            throw new ApiError(
                400,
                body.error.message
            );
        }

        const project =
            await ProjectService.updateProject(
                params.data.projectId,
                req.user._id,
                body.data
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Project updated successfully.",
                project
            )
        );

    } catch (error) {
        next(error);
    }

};

export const archiveProject = async (
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

        await ProjectService.archiveProject(
            params.data.projectId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Project archived successfully."
            )
        );

    } catch (error) {
        next(error);
    }

};

export const restoreProject = async (
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

        await ProjectService.restoreProject(
            params.data.projectId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Project restored successfully."
            )
        );

    } catch (error) {
        next(error);
    }

};