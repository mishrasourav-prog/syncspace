import type { NextFunction, Request, Response } from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import {
  deleteWorkspaceAvatarAssetBestEffort,
  uploadWorkspaceAvatarBuffer,
} from "./workspace.avatar";

import WorkspaceService from "./workspace.service";

import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdSchema,
} from "./workspace.validation";

const getAuthenticatedUserId = (req: Request): string => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized.");
  }

  return req.user._id;
};

export const createWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const data = createWorkspaceSchema.parse(req.body);

    const workspace = await WorkspaceService.createWorkspace(
      getAuthenticatedUserId(req),
      data,
    );

    return res
      .status(201)
      .json(new ApiResponse(201, "Workspace created successfully.", workspace));
  } catch (error) {
    return next(error);
  }
};

export const getUserWorkspaces = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const workspaces = await WorkspaceService.getUserWorkspaces(
      getAuthenticatedUserId(req),
    );

    return res.status(200).json(
      new ApiResponse(200, "Workspaces fetched successfully.", {
        workspaces,
      }),
    );
  } catch (error) {
    return next(error);
  }
};

export const getWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { workspaceId } = workspaceIdSchema.parse(req.params);

    const workspace = await WorkspaceService.getWorkspace(
      workspaceId,
      getAuthenticatedUserId(req),
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Workspace fetched successfully.", workspace));
  } catch (error) {
    return next(error);
  }
};

export const updateWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { workspaceId } = workspaceIdSchema.parse(req.params);

    const data = updateWorkspaceSchema.parse(req.body);

    const workspace = await WorkspaceService.updateWorkspace(
      workspaceId,
      getAuthenticatedUserId(req),
      data,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Workspace updated successfully.", workspace));
  } catch (error) {
    return next(error);
  }
};

export const authorizeWorkspaceAvatarManagement = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { workspaceId } = workspaceIdSchema.parse(req.params);

    await WorkspaceService.assertCanManageAvatar(
      workspaceId,
      getAuthenticatedUserId(req),
    );

    next();
  } catch (error) {
    next(error);
  }
};

export const replaceWorkspaceAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  let uploadedPublicId: string | null = null;

  try {
    const { workspaceId } = workspaceIdSchema.parse(req.params);

    if (!req.file) {
      throw new ApiError(
        400,
        'A workspace avatar image is required in the "avatar" field.',
      );
    }

    const uploadedAvatar = await uploadWorkspaceAvatarBuffer(
      req.file.buffer,
      workspaceId,
    );

    uploadedPublicId = uploadedAvatar.publicId;

    let result: Awaited<
      ReturnType<typeof WorkspaceService.replaceWorkspaceAvatar>
    >;

    try {
      result = await WorkspaceService.replaceWorkspaceAvatar(
        workspaceId,
        getAuthenticatedUserId(req),
        uploadedAvatar.url,
        uploadedAvatar.publicId,
      );
    } catch (error) {
      await deleteWorkspaceAvatarAssetBestEffort(uploadedAvatar.publicId);

      uploadedPublicId = null;

      throw error;
    }

    uploadedPublicId = null;

    await deleteWorkspaceAvatarAssetBestEffort(result.previousAvatarPublicId);

    return res.status(200).json(
      new ApiResponse(200, "Workspace avatar updated successfully.", {
        workspace: result.workspace,
      }),
    );
  } catch (error) {
    if (uploadedPublicId) {
      await deleteWorkspaceAvatarAssetBestEffort(uploadedPublicId);
    }

    return next(error);
  }
};

export const removeWorkspaceAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { workspaceId } = workspaceIdSchema.parse(req.params);

    const result = await WorkspaceService.removeWorkspaceAvatar(
      workspaceId,
      getAuthenticatedUserId(req),
    );

    await deleteWorkspaceAvatarAssetBestEffort(result.previousAvatarPublicId);

    return res.status(200).json(
      new ApiResponse(200, "Workspace avatar removed successfully.", {
        workspace: result.workspace,
      }),
    );
  } catch (error) {
    return next(error);
  }
};

export const archiveWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { workspaceId } = workspaceIdSchema.parse(req.params);

    await WorkspaceService.archiveWorkspace(
      workspaceId,
      getAuthenticatedUserId(req),
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Workspace archived successfully."));
  } catch (error) {
    return next(error);
  }
};

export const restoreWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { workspaceId } = workspaceIdSchema.parse(req.params);

    await WorkspaceService.restoreWorkspace(
      workspaceId,
      getAuthenticatedUserId(req),
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Workspace restored successfully."));
  } catch (error) {
    return next(error);
  }
};
