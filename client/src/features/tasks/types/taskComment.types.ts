export interface TaskCommentAuthor {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface TaskComment {
  _id: string;
  task: string;

  author: TaskCommentAuthor | null;
  body: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCommentsPage {
  comments: TaskComment[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CreateTaskCommentPayload {
  body: string;
}

export interface UpdateTaskCommentPayload {
  body: string;
}
