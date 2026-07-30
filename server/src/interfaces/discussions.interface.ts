export interface IDiscussionUserPreview {
  _id: string;

  name: string;

  username: string;

  avatar?: string;
}

export interface IDiscussionResponse {
  _id: string;

  workspace: string;

  project: string;

  title: string;

  body: string;

  author: IDiscussionUserPreview | null;

  isPinned: boolean;

  isLocked: boolean;

  replyCount: number;

  createdAt: Date;

  updatedAt: Date;
}

export interface IDiscussionReplyResponse {
  _id: string;

  workspace: string;

  project: string;

  discussion: string;

  author: IDiscussionUserPreview | null;

  body: string | null;

  isDeleted: boolean;

  createdAt: Date;

  updatedAt: Date;
}

export interface ICreateDiscussionInput {
  title: string;

  body: string;
}

export interface IUpdateDiscussionInput {
  title?: string;

  body?: string;
}

export interface ICreateDiscussionReplyInput {
  body: string;
}

export interface IUpdateDiscussionReplyInput {
  body: string;
}

export interface IDiscussionListQuery {
  search?: string;

  cursor?: string;

  limit: number;
}

export interface IDiscussionReplyListQuery {
  cursor?: string;

  limit: number;
}

export interface IDiscussionListResponse {
  discussions: IDiscussionResponse[];

  nextCursor: string | null;
}

export interface IDiscussionReplyListResponse {
  replies: IDiscussionReplyResponse[];

  nextCursor: string | null;
}
