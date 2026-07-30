import type { NextFunction, Request, Response } from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import taskAssignmentRequestService from "./taskAssignmentRequest.service";
import {
  taskAssignmentRequestParamsSchema,
  taskAssignmentRequestTaskParamsSchema,
} from "./taskAssignmentRequest.validation";

function requireUser(req: Request): string {
  if (!req.user) throw new ApiError(401, "Unauthorized.");
  return req.user._id.toString();
}

export const getTaskAssignmentRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = requireUser(req);
    const { taskId } = taskAssignmentRequestTaskParamsSchema.parse(req.params);
    const result = await taskAssignmentRequestService.getRequests(
      taskId,
      userId,
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Assignment requests fetched successfully.",
          result,
        ),
      );
  } catch (error) {
    return next(error);
  }
};

export const createTaskAssignmentRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = requireUser(req);
    const { taskId } = taskAssignmentRequestTaskParamsSchema.parse(req.params);
    const request = await taskAssignmentRequestService.createRequest(
      taskId,
      userId,
    );
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Assignment request sent to project admins.",
          request,
        ),
      );
  } catch (error) {
    return next(error);
  }
};

export const acceptTaskAssignmentRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = requireUser(req);
    const { taskId, requestId } = taskAssignmentRequestParamsSchema.parse(
      req.params,
    );
    const request = await taskAssignmentRequestService.acceptRequest(
      taskId,
      requestId,
      userId,
    );
    return res
      .status(200)
      .json(new ApiResponse(200, "Assignment request accepted.", request));
  } catch (error) {
    return next(error);
  }
};
