import type { Request, Response, NextFunction } from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import ProjectService from "./project.service";

import {
  createProjectSchema,
  projectIdSchema,
  updateProjectSchema,
} from "./project.validation";

import { workspaceIdSchema } from "../workspace/workspace.validation";

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { workspaceId } = workspaceIdSchema.parse(req.params);

    const data = createProjectSchema.parse(req.body);

    const project = await ProjectService.createProject(
      workspaceId,
      req.user._id,
      data,
    );

    return res
      .status(201)
      .json(new ApiResponse(201, "Project created successfully.", project));
  } catch (error) {
    return next(error);
  }
};

export const getWorkspaceProjects = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { workspaceId } = workspaceIdSchema.parse(req.params);

    const projects = await ProjectService.getWorkspaceProjects(
      workspaceId,
      req.user._id,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Projects fetched successfully.", projects));
  } catch (error) {
    return next(error);
  }
};

export const getProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { projectId } = projectIdSchema.parse(req.params);

    const project = await ProjectService.getProject(projectId, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Project fetched successfully.", project));
  } catch (error) {
    return next(error);
  }
};

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { projectId } = projectIdSchema.parse(req.params);

    const data = updateProjectSchema.parse(req.body);

    const project = await ProjectService.updateProject(
      projectId,
      req.user._id,
      data,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Project updated successfully.", project));
  } catch (error) {
    return next(error);
  }
};

export const archiveProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { projectId } = projectIdSchema.parse(req.params);

    await ProjectService.archiveProject(projectId, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Project archived successfully."));
  } catch (error) {
    return next(error);
  }
};

export const restoreProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { projectId } = projectIdSchema.parse(req.params);

    await ProjectService.restoreProject(projectId, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Project restored successfully."));
  } catch (error) {
    return next(error);
  }
};
