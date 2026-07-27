export type NotificationType = "task_assigned" | "task_status_changed" | "discussion.reply";

export type NotificationEntityType = "task" | "discussion";

export interface NotificationActor {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  actor: NotificationActor | null;
  type: NotificationType;
  title: string;
  message: string;
  workspace: string | null;
  project: string | null;
  entityType: NotificationEntityType | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export type NotificationFilter = "all" | "unread" | "tasks" | "discussions" | "read";

export type NotificationSort = "newest" | "oldest";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export interface TaskAssignedMetadata {
  taskTitle?: string;
  taskType?: "task" | "issue";
}

export interface TaskStatusChangedMetadata {
  taskTitle?: string;
  previousStatus?: TaskStatus;
  currentStatus?: TaskStatus;
}

export interface DiscussionReplyMetadata {
  discussionTitle?: string;
  replyId?: string;
}
