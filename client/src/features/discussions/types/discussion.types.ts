export interface DiscussionUserPreview {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface Discussion {
  _id: string;
  workspace: string;
  project: string;
  title: string;
  body: string;
  author: DiscussionUserPreview | null;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionListResult {
  discussions: Discussion[];
  nextCursor: string | null;
}

export interface DiscussionReply {
  _id: string;
  workspace: string;
  project: string;
  discussion: string;
  author: DiscussionUserPreview | null;
  /** Null once the reply has been (soft) deleted. */
  body: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReplyListResult {
  replies: DiscussionReply[];
  nextCursor: string | null;
}

export interface CreateDiscussionPayload {
  title: string;
  body: string;
}

export interface UpdateDiscussionPayload {
  title?: string;
  body?: string;
}

export interface CreateDiscussionReplyPayload {
  body: string;
}

export interface UpdateDiscussionReplyPayload {
  body: string;
}

/** Client-side view filter applied over loaded discussion pages. Not a server sort/filter endpoint. */
export type DiscussionListFilter = "all" | "pinned" | "mine" | "locked";
