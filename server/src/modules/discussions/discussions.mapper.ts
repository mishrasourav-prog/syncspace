import { Types } from "mongoose";

import type {
  IDiscussionReplyResponse,
  IDiscussionResponse,
  IDiscussionUserPreview,
} from "../../interfaces/discussions.interface";

interface IPopulatedDiscussionUser {
  _id: Types.ObjectId;

  name: string;

  username: string;

  avatar?: string;
}

export interface IDiscussionForResponse {
  _id: Types.ObjectId;

  workspace: Types.ObjectId;

  project: Types.ObjectId;

  title: string;

  body: string;

  author: IPopulatedDiscussionUser | null;

  isPinned: boolean;

  isLocked: boolean;

  replyCount?: number;

  createdAt: Date;

  updatedAt: Date;
}

export interface IDiscussionReplyForResponse {
  _id: Types.ObjectId;

  workspace: Types.ObjectId;

  project: Types.ObjectId;

  discussion: Types.ObjectId;

  author: IPopulatedDiscussionUser | null;

  body: string;

  isDeleted: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const mapUserPreview = (
  user: IPopulatedDiscussionUser | null,
): IDiscussionUserPreview | null => {
  if (!user) {
    return null;
  }

  return {
    _id: user._id.toString(),

    name: user.name,

    username: user.username,

    avatar: user.avatar,
  };
};

export const mapDiscussion = (
  discussion: IDiscussionForResponse,
): IDiscussionResponse => {
  return {
    _id: discussion._id.toString(),

    workspace: discussion.workspace.toString(),

    project: discussion.project.toString(),

    title: discussion.title,

    body: discussion.body,

    author: mapUserPreview(discussion.author),

    isPinned: discussion.isPinned,

    isLocked: discussion.isLocked,

    replyCount: discussion.replyCount ?? 0,

    createdAt: discussion.createdAt,

    updatedAt: discussion.updatedAt,
  };
};

export const mapDiscussionReply = (
  reply: IDiscussionReplyForResponse,
): IDiscussionReplyResponse => {
  return {
    _id: reply._id.toString(),

    workspace: reply.workspace.toString(),

    project: reply.project.toString(),

    discussion: reply.discussion.toString(),

    author: mapUserPreview(reply.author),

    body: reply.isDeleted ? null : reply.body,

    isDeleted: reply.isDeleted,

    createdAt: reply.createdAt,

    updatedAt: reply.updatedAt,
  };
};
