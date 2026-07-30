import { Types } from "mongoose";
import type { FilterQuery } from "mongoose";

import ApiError from "../../utils/ApiError";

import { DomainEventName, eventBus } from "../../events";

import {
  decodePaginationCursor,
  encodePaginationCursor,
} from "../../utils/paginationCursor.util";

import Task from "../tasks/task.model";

import Project from "../project/project.model";

import ProjectMember from "../projectMember/projectMember.model";

import { ProjectRole } from "../../interfaces/projectMember.interface";

import { Workspace } from "../workspace/workspace.model";

import TaskComment, { ITaskCommentDocument } from "./taskComment.model";

import {
  ICreateTaskComment,
  IGetTaskCommentsQuery,
  ITaskCommentAuthorDocument,
  ITaskCommentPopulatedDocument,
  ITaskCommentResponse,
  ITaskCommentsResponse,
  IUpdateTaskComment,
} from "../../interfaces/taskComment.interface";

export class TaskCommentService {
  private mapComment(
    comment: ITaskCommentPopulatedDocument,
  ): ITaskCommentResponse {
    const author = comment.author;

    return {
      _id: comment._id.toString(),

      task: comment.task.toString(),

      author: author
        ? {
            _id: author._id.toString(),

            name: author.name,

            username: author.username,

            avatar: author.avatar,
          }
        : null,

      body: comment.isDeleted ? "This comment has been deleted." : comment.body,

      isEdited: comment.isEdited,

      editedAt: comment.editedAt,

      isDeleted: comment.isDeleted,

      deletedAt: comment.deletedAt,

      createdAt: comment.createdAt,

      updatedAt: comment.updatedAt,
    };
  }

  private async populateAndMap(
    comment: ITaskCommentDocument,
  ): Promise<ITaskCommentResponse> {
    const populatedComment = await comment.populate<{
      author: ITaskCommentAuthorDocument | null;
    }>("author", "name username avatar");

    return this.mapComment(populatedComment as ITaskCommentPopulatedDocument);
  }

  async createComment(
    taskId: string,
    userId: string,
    data: ICreateTaskComment,
  ): Promise<ITaskCommentResponse> {
    const task = await Task.findById(taskId)
      .select("_id project isArchived")
      .lean();

    if (!task) {
      throw new ApiError(404, "Task not found.");
    }

    const membershipExists = await ProjectMember.exists({
      project: task.project,

      user: userId,
    });

    if (!membershipExists) {
      throw new ApiError(403, "You are not a member of this project.");
    }

    const project = await Project.findById(task.project)
      .select("_id workspace isArchived")
      .lean();

    if (!project) {
      throw new ApiError(404, "Project not found.");
    }

    const workspace = await Workspace.findById(project.workspace)
      .select("_id isArchived")
      .lean();

    if (!workspace) {
      throw new ApiError(404, "Workspace not found.");
    }

    if (workspace.isArchived) {
      throw new ApiError(
        409,
        "Comments cannot be added while the workspace is archived.",
      );
    }

    if (project.isArchived) {
      throw new ApiError(
        409,
        "Comments cannot be added to an archived project.",
      );
    }

    if (task.isArchived) {
      throw new ApiError(409, "Comments cannot be added to an archived task.");
    }

    const comment = await TaskComment.create({
      task: task._id,

      author: new Types.ObjectId(userId),

      body: data.body,
    });

    await eventBus.publish(DomainEventName.TASK_COMMENT_CREATED, {
      workspaceId: workspace._id.toString(),
      projectId: project._id.toString(),
      taskId: task._id.toString(),
      commentId: comment._id.toString(),
      actorId: userId,
    });

    return this.populateAndMap(comment);
  }

  async getTaskComments(
    taskId: string,
    userId: string,
    query: IGetTaskCommentsQuery,
  ): Promise<ITaskCommentsResponse> {
    const task = await Task.findById(taskId).select("_id project").lean();

    if (!task) {
      throw new ApiError(404, "Task not found.");
    }

    const membershipExists = await ProjectMember.exists({
      project: task.project,

      user: userId,
    });

    if (!membershipExists) {
      throw new ApiError(403, "You are not a member of this project.");
    }

    const filter: FilterQuery<ITaskCommentDocument> = {
      task: task._id,
    };

    if (query.cursor) {
      const cursorPosition = decodePaginationCursor(query.cursor);

      filter.$or = [
        {
          createdAt: {
            $gt: cursorPosition.createdAt,
          },
        },
        {
          createdAt: cursorPosition.createdAt,

          _id: {
            $gt: cursorPosition.id,
          },
        },
      ];
    }

    const comments = await TaskComment.find(filter)
      .sort({
        createdAt: 1,
        _id: 1,
      })
      .limit(query.limit + 1)
      .populate<{
        author: ITaskCommentAuthorDocument | null;
      }>("author", "name username avatar")
      .exec();

    const hasMore = comments.length > query.limit;

    const pageComments = hasMore ? comments.slice(0, query.limit) : comments;

    const lastComment = pageComments.at(-1);

    const nextCursor =
      hasMore && lastComment
        ? encodePaginationCursor({
            createdAt: lastComment.createdAt,

            id: lastComment._id,
          })
        : null;

    return {
      comments: pageComments.map((comment) =>
        this.mapComment(comment as ITaskCommentPopulatedDocument),
      ),

      nextCursor,

      hasMore,
    };
  }

  async updateComment(
    commentId: string,
    userId: string,
    data: IUpdateTaskComment,
  ): Promise<ITaskCommentResponse> {
    const comment = await TaskComment.findById(commentId);

    if (!comment) {
      throw new ApiError(404, "Comment not found.");
    }

    const task = await Task.findById(comment.task)
      .select("_id project isArchived")
      .lean();

    if (!task) {
      throw new ApiError(404, "Task not found.");
    }

    const membershipExists = await ProjectMember.exists({
      project: task.project,

      user: userId,
    });

    if (!membershipExists) {
      throw new ApiError(403, "You are not a member of this project.");
    }

    if (comment.author.toString() !== userId) {
      throw new ApiError(403, "You can only edit your own comments.");
    }

    if (comment.isDeleted) {
      throw new ApiError(409, "Deleted comments cannot be edited.");
    }

    const project = await Project.findById(task.project)
      .select("_id workspace isArchived")
      .lean();

    if (!project) {
      throw new ApiError(404, "Project not found.");
    }

    const workspace = await Workspace.findById(project.workspace)
      .select("_id isArchived")
      .lean();

    if (!workspace) {
      throw new ApiError(404, "Workspace not found.");
    }

    if (workspace.isArchived) {
      throw new ApiError(
        409,
        "Comments cannot be edited while the workspace is archived.",
      );
    }

    if (project.isArchived) {
      throw new ApiError(
        409,
        "Comments cannot be edited in an archived project.",
      );
    }

    if (task.isArchived) {
      throw new ApiError(409, "Comments cannot be edited on an archived task.");
    }

    if (comment.body === data.body) {
      return this.populateAndMap(comment);
    }

    comment.body = data.body;

    comment.isEdited = true;

    comment.editedAt = new Date();

    await comment.save();

    await eventBus.publish(DomainEventName.TASK_COMMENT_UPDATED, {
      workspaceId: workspace._id.toString(),
      projectId: project._id.toString(),
      taskId: task._id.toString(),
      commentId: comment._id.toString(),
      actorId: userId,
    });

    return this.populateAndMap(comment);
  }

  async deleteComment(
    commentId: string,
    userId: string,
  ): Promise<ITaskCommentResponse> {
    const comment = await TaskComment.findById(commentId);

    if (!comment) {
      throw new ApiError(404, "Comment not found.");
    }

    const task = await Task.findById(comment.task)
      .select("_id project isArchived")
      .lean();

    if (!task) {
      throw new ApiError(404, "Task not found.");
    }

    const membership = await ProjectMember.findOne({
      project: task.project,

      user: userId,
    })
      .select("role")
      .lean();

    if (!membership) {
      throw new ApiError(403, "You are not a member of this project.");
    }

    const isAuthor = comment.author.toString() === userId;

    const isProjectAdmin = membership.role === ProjectRole.ADMIN;

    if (!isAuthor && !isProjectAdmin) {
      throw new ApiError(
        403,
        "Only the comment author or a project admin can delete this comment.",
      );
    }

    if (comment.isDeleted) {
      return this.populateAndMap(comment);
    }

    const project = await Project.findById(task.project)
      .select("_id workspace isArchived")
      .lean();

    if (!project) {
      throw new ApiError(404, "Project not found.");
    }

    const workspace = await Workspace.findById(project.workspace)
      .select("_id isArchived")
      .lean();

    if (!workspace) {
      throw new ApiError(404, "Workspace not found.");
    }

    if (workspace.isArchived) {
      throw new ApiError(
        409,
        "Comments cannot be deleted while the workspace is archived.",
      );
    }

    if (project.isArchived) {
      throw new ApiError(
        409,
        "Comments cannot be deleted in an archived project.",
      );
    }

    if (task.isArchived) {
      throw new ApiError(
        409,
        "Comments cannot be deleted on an archived task.",
      );
    }

    comment.body = "";

    comment.isDeleted = true;

    comment.deletedAt = new Date();

    comment.deletedBy = new Types.ObjectId(userId);

    await comment.save();

    await eventBus.publish(DomainEventName.TASK_COMMENT_DELETED, {
      workspaceId: workspace._id.toString(),
      projectId: project._id.toString(),
      taskId: task._id.toString(),
      commentId: comment._id.toString(),
      actorId: userId,
    });

    return this.populateAndMap(comment);
  }
}

export default new TaskCommentService();
