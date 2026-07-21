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
