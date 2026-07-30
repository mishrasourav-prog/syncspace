import { Request, Response, NextFunction } from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import taskCommentService from "./taskComment.services";

import {
  createTaskCommentSchema,
  updateTaskCommentSchema,
  taskCommentTaskParamsSchema,
  taskCommentParamsSchema,
  getTaskCommentsQuerySchema,
} from "./taskComment.validation";

export const createTaskComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { taskId } = taskCommentTaskParamsSchema.parse(req.params);

    const data = createTaskCommentSchema.parse(req.body);

    const comment = await taskCommentService.createComment(
      taskId,
      req.user._id.toString(),
      data,
    );

    return res.status(201).json(
      new ApiResponse(
        201,

        "Comment created successfully.",
        comment,
      ),
    );
  } catch (error) {
    return next(error);
  }
};

export const getTaskComments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { taskId } = taskCommentTaskParamsSchema.parse(req.params);

    const query = getTaskCommentsQuerySchema.parse(req.query);

    const result = await taskCommentService.getTaskComments(
      taskId,
      req.user._id.toString(),
      query,
    );

    return res.status(200).json(
      new ApiResponse(
        200,

        "Comments fetched successfully.",
        result,
      ),
    );
  } catch (error) {
    return next(error);
  }
};

export const updateTaskComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { commentId } = taskCommentParamsSchema.parse(req.params);

    const data = updateTaskCommentSchema.parse(req.body);

    const comment = await taskCommentService.updateComment(
      commentId,
      req.user._id.toString(),
      data,
    );

    return res.status(200).json(
      new ApiResponse(
        200,

        "Comment updated successfully.",
        comment,
      ),
    );
  } catch (error) {
    return next(error);
  }
};

export const deleteTaskComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { commentId } = taskCommentParamsSchema.parse(req.params);

    const comment = await taskCommentService.deleteComment(
      commentId,
      req.user._id.toString(),
    );

    return res.status(200).json(
      new ApiResponse(
        200,

        "Comment deleted successfully.",
        comment,
      ),
    );
  } catch (error) {
    return next(error);
  }
};
