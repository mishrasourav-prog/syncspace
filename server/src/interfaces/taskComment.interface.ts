import { Types } from "mongoose";

import { ITaskCommentDocument } from "../modules/taskComment/taskComment.model";

export interface ICreateTaskComment {
  body: string;
}

export interface IUpdateTaskComment {
  body: string;
}

export interface IGetTaskCommentsQuery {
  cursor?: string;
  limit: number;
}

export interface ITaskCommentAuthorDocument {
  _id: Types.ObjectId;
  name: string;
  username: string;
  avatar?: string;
}

export interface ITaskCommentAuthor {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

export type ITaskCommentPopulatedDocument = Omit<
  ITaskCommentDocument,
  "author"
> & {
  author: ITaskCommentAuthorDocument | null;
};

export interface ITaskCommentResponse {
  _id: string;

  task: string;

  author: ITaskCommentAuthor | null;

  body: string;

  isEdited: boolean;

  editedAt?: Date;

  isDeleted: boolean;

  deletedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

export interface ITaskCommentsResponse {
  comments: ITaskCommentResponse[];

  nextCursor: string | null;

  hasMore: boolean;
}
