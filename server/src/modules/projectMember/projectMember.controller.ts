import type { Request, Response, NextFunction } from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import ProjectMemberService from "./projectMember.service";

import {
  projectMemberParamsSchema,
  projectMemberProjectParamsSchema,
  updateProjectMemberRoleSchema,
} from "./projectMember.validation";

export const getProjectMembers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { projectId } = projectMemberProjectParamsSchema.parse(req.params);

    const members = await ProjectMemberService.getProjectMembers(
      projectId,
      req.user._id,
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Project members fetched successfully.", members),
      );
  } catch (error) {
    return next(error);
  }
};

export const updateProjectMemberRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { projectId, memberId } = projectMemberParamsSchema.parse(req.params);

    const { role } = updateProjectMemberRoleSchema.parse(req.body);

    const member = await ProjectMemberService.updateMemberRole(
      projectId,
      memberId,
      req.user._id,
      role,
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Project member role updated successfully.",
          member,
        ),
      );
  } catch (error) {
    return next(error);
  }
};

export const removeProjectMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { projectId, memberId } = projectMemberParamsSchema.parse(req.params);

    await ProjectMemberService.removeMember(projectId, memberId, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Project member removed successfully."));
  } catch (error) {
    return next(error);
  }
};

export const leaveProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { projectId } = projectMemberProjectParamsSchema.parse(req.params);

    await ProjectMemberService.leaveProject(projectId, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Left project successfully."));
  } catch (error) {
    return next(error);
  }
};
