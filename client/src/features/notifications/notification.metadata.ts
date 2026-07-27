import type {
  DiscussionReplyMetadata,
  NotificationItem,
  TaskAssignedMetadata,
  TaskStatus,
  TaskStatusChangedMetadata,
} from "./notification.types";

const TASK_STATUSES: readonly TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function readTaskStatus(source: Record<string, unknown>, key: string): TaskStatus | undefined {
  const value = source[key];
  return typeof value === "string" && (TASK_STATUSES as readonly string[]).includes(value)
    ? (value as TaskStatus)
    : undefined;
}

/** Narrows unknown metadata into the shape expected for a task-assigned notification, never throwing. */
export function getTaskAssignedMetadata(notification: NotificationItem): TaskAssignedMetadata {
  if (!isRecord(notification.metadata)) return {};

  const taskType = notification.metadata.taskType;
  return {
    taskTitle: readString(notification.metadata, "taskTitle"),
    taskType: taskType === "task" || taskType === "issue" ? taskType : undefined,
  };
}

/** Narrows unknown metadata into the shape expected for a task-status-changed notification, never throwing. */
export function getTaskStatusChangedMetadata(notification: NotificationItem): TaskStatusChangedMetadata {
  if (!isRecord(notification.metadata)) return {};

  return {
    taskTitle: readString(notification.metadata, "taskTitle"),
    previousStatus: readTaskStatus(notification.metadata, "previousStatus"),
    currentStatus: readTaskStatus(notification.metadata, "currentStatus"),
  };
}

/** Narrows unknown metadata into the shape expected for a discussion-reply notification, never throwing. */
export function getDiscussionReplyMetadata(notification: NotificationItem): DiscussionReplyMetadata {
  if (!isRecord(notification.metadata)) return {};

  return {
    discussionTitle: readString(notification.metadata, "discussionTitle"),
    replyId: readString(notification.metadata, "replyId"),
  };
}

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
};

/** Converts a raw task-status enum value into a human-readable label. */
export function formatTaskStatus(status: TaskStatus | undefined): string | undefined {
  return status ? TASK_STATUS_LABELS[status] : undefined;
}

/** Returns a safe, non-crashing subtitle for the notification's supplemental metadata row, or undefined when unavailable. */
export function getNotificationSupplementalText(notification: NotificationItem): string | undefined {
  switch (notification.type) {
    case "task_assigned": {
      const { taskTitle } = getTaskAssignedMetadata(notification);
      return taskTitle;
    }
    case "task_status_changed": {
      const { previousStatus, currentStatus } = getTaskStatusChangedMetadata(notification);
      const from = formatTaskStatus(previousStatus);
      const to = formatTaskStatus(currentStatus);
      if (from && to) return `${from} → ${to}`;
      return undefined;
    }
    case "discussion.reply": {
      const { discussionTitle } = getDiscussionReplyMetadata(notification);
      return discussionTitle;
    }
    default:
      return undefined;
  }
}
