import type { NextFunction, Request, Response } from "express";

import ApiResponse from "../../utils/ApiResponse";

import discussionService from "../discussions/discussions.service";

import {
  createDiscussionBodySchema,
  createDiscussionReplyBodySchema,
  discussionIdParamSchema,
  getDiscussionRepliesQuerySchema,
  getDiscussionsQuerySchema,
  projectIdParamSchema,
  replyIdParamSchema,
  updateDiscussionBodySchema,
  updateDiscussionReplyBodySchema,
} from "../discussions/discussions.validation";

class DiscussionController {
  async createDiscussion(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { projectId } = projectIdParamSchema.parse(req.params);

      const data = createDiscussionBodySchema.parse(req.body);

      const discussion = await discussionService.createDiscussion(
        projectId,
        req.user!._id,
        data,
      );

      return res
        .status(201)
        .json(
          new ApiResponse(201, "Discussion created successfully.", discussion),
        );
    } catch (error) {
      return next(error);
    }
  }

  async getProjectDiscussions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { projectId } = projectIdParamSchema.parse(req.params);

      const query = getDiscussionsQuerySchema.parse(req.query);

      const result = await discussionService.getProjectDiscussions(
        projectId,
        req.user!._id,
        query,
      );

      return res
        .status(200)
        .json(
          new ApiResponse(200, "Discussions retrieved successfully.", result),
        );
    } catch (error) {
      return next(error);
    }
  }

  async getDiscussionById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { discussionId } = discussionIdParamSchema.parse(req.params);

      const discussion = await discussionService.getDiscussionById(
        discussionId,
        req.user!._id,
      );

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Discussion retrieved successfully.",
            discussion,
          ),
        );
    } catch (error) {
      return next(error);
    }
  }

  async updateDiscussion(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { discussionId } = discussionIdParamSchema.parse(req.params);

      const data = updateDiscussionBodySchema.parse(req.body);

      const discussion = await discussionService.updateDiscussion(
        discussionId,
        req.user!._id,
        data,
      );

      return res
        .status(200)
        .json(
          new ApiResponse(200, "Discussion updated successfully.", discussion),
        );
    } catch (error) {
      return next(error);
    }
  }

  async deleteDiscussion(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { discussionId } = discussionIdParamSchema.parse(req.params);

      await discussionService.deleteDiscussion(discussionId, req.user!._id);

      return res
        .status(200)
        .json(new ApiResponse(200, "Discussion deleted successfully."));
    } catch (error) {
      return next(error);
    }
  }

  async pinDiscussion(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { discussionId } = discussionIdParamSchema.parse(req.params);

      const discussion = await discussionService.pinDiscussion(
        discussionId,
        req.user!._id,
      );

      return res
        .status(200)
        .json(
          new ApiResponse(200, "Discussion pinned successfully.", discussion),
        );
    } catch (error) {
      return next(error);
    }
  }

  async unpinDiscussion(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { discussionId } = discussionIdParamSchema.parse(req.params);

      const discussion = await discussionService.unpinDiscussion(
        discussionId,
        req.user!._id,
      );

      return res
        .status(200)
        .json(
          new ApiResponse(200, "Discussion unpinned successfully.", discussion),
        );
    } catch (error) {
      return next(error);
    }
  }

  async lockDiscussion(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { discussionId } = discussionIdParamSchema.parse(req.params);

      const discussion = await discussionService.lockDiscussion(
        discussionId,
        req.user!._id,
      );

      return res
        .status(200)
        .json(
          new ApiResponse(200, "Discussion locked successfully.", discussion),
        );
    } catch (error) {
      return next(error);
    }
  }

  async unlockDiscussion(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { discussionId } = discussionIdParamSchema.parse(req.params);

      const discussion = await discussionService.unlockDiscussion(
        discussionId,
        req.user!._id,
      );

      return res
        .status(200)
        .json(
          new ApiResponse(200, "Discussion unlocked successfully.", discussion),
        );
    } catch (error) {
      return next(error);
    }
  }

  async createReply(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { discussionId } = discussionIdParamSchema.parse(req.params);

      const data = createDiscussionReplyBodySchema.parse(req.body);

      const reply = await discussionService.createReply(
        discussionId,
        req.user!._id,
        data,
      );

      return res
        .status(201)
        .json(new ApiResponse(201, "Reply created successfully.", reply));
    } catch (error) {
      return next(error);
    }
  }

  async getReplies(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { discussionId } = discussionIdParamSchema.parse(req.params);

      const query = getDiscussionRepliesQuerySchema.parse(req.query);

      const replies = await discussionService.getReplies(
        discussionId,
        req.user!._id,
        query,
      );

      return res
        .status(200)
        .json(new ApiResponse(200, "Replies retrieved successfully.", replies));
    } catch (error) {
      return next(error);
    }
  }

  async updateReply(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { replyId } = replyIdParamSchema.parse(req.params);

      const data = updateDiscussionReplyBodySchema.parse(req.body);

      const reply = await discussionService.updateReply(
        replyId,
        req.user!._id,
        data,
      );

      return res
        .status(200)
        .json(new ApiResponse(200, "Reply updated successfully.", reply));
    } catch (error) {
      return next(error);
    }
  }

  async deleteReply(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { replyId } = replyIdParamSchema.parse(req.params);

      await discussionService.deleteReply(replyId, req.user!._id);

      return res
        .status(200)
        .json(new ApiResponse(200, "Reply deleted successfully."));
    } catch (error) {
      return next(error);
    }
  }
}

const discussionController = new DiscussionController();

export default discussionController;
