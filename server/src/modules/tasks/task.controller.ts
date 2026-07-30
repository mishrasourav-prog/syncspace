import type { Request, Response, NextFunction } from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import { projectIdSchema } from "../project/project.validation";

import TaskService from "./task.service";

import {
  createTaskSchema,
  taskIdParamSchema,
  updateTaskSchema,
} from "./task.validation";

import { objectIdSchema } from "../../validators/common.validation";

import { updateTaskStatusSchema } from "./task.validation";

import { reorderProjectTasksBodySchema } from "./task.validation";
import { projectIdParamSchema } from "../documents/document.validation";

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { projectId } = projectIdSchema.parse(req.params);

    const data = createTaskSchema.parse(req.body);

    const task = await TaskService.createTask(projectId, req.user._id, data);

    return res
      .status(201)
      .json(new ApiResponse(201, "Task created successfully.", task));
  } catch (error) {
    return next(error);
  }
};

export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { taskId } = taskIdParamSchema.parse(req.params);

    const task = await TaskService.getTask(taskId, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Task fetched successfully.", task));
  } catch (error) {
    return next(error);
  }
};

export const getProjectTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { projectId } = projectIdSchema.parse(req.params);

    const tasks = await TaskService.getProjectTasks(projectId, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Tasks fetched successfully.", tasks));
  } catch (error) {
    return next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { taskId } = taskIdParamSchema.parse(req.params);

    const data = updateTaskSchema.parse(req.body);

    const task = await TaskService.updateTask(taskId, req.user._id, data);

    return res
      .status(200)
      .json(new ApiResponse(200, "Task updated successfully.", task));
  } catch (error) {
    return next(error);
  }
};

export const archiveTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { taskId } = taskIdParamSchema.parse(req.params);

    await TaskService.archiveTask(taskId, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Task archived successfully."));
  } catch (error) {
    return next(error);
  }
};

export const restoreTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { taskId } = taskIdParamSchema.parse(req.params);

    await TaskService.restoreTask(taskId, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Task restored successfully."));
  } catch (error) {
    return next(error);
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskId = objectIdSchema.parse(req.params.taskId);

    const data = updateTaskStatusSchema.parse(req.body);

    const task = await TaskService.updateTaskStatus(
      taskId,
      req.user!._id,
      data.status,
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Task status updated successfully.", task));
  } catch (error) {
    return next(error);
  }
};

export const reorderProjectTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { projectId } = projectIdParamSchema.parse(req.params);

    const data = reorderProjectTasksBodySchema.parse(req.body);

    const result = await TaskService.reorderProjectTasks(
      projectId,
      req.user!._id,
      data,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Tasks reordered successfully.", result));
  } catch (error) {
    return next(error);
  }
};
