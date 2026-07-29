import type {
  CollaborationNotificationMetadata,
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

export function getTaskAssignedMetadata(notification: NotificationItem): TaskAssignedMetadata {
  if (!isRecord(notification.metadata)) return {};

  const taskType = notification.metadata.taskType;
  return {
    taskTitle: readString(notification.metadata, "taskTitle"),
    taskType: taskType === "task" || taskType === "issue" ? taskType : undefined,
  };
}

export function getTaskStatusChangedMetadata(notification: NotificationItem): TaskStatusChangedMetadata {
  if (!isRecord(notification.metadata)) return {};

  return {
    taskTitle: readString(notification.metadata, "taskTitle"),
    previousStatus: readTaskStatus(notification.metadata, "previousStatus"),
    currentStatus: readTaskStatus(notification.metadata, "currentStatus"),
  };
}

export function getDiscussionReplyMetadata(notification: NotificationItem): DiscussionReplyMetadata {
  if (!isRecord(notification.metadata)) return {};

  return {
    discussionTitle: readString(notification.metadata, "discussionTitle"),
    replyId: readString(notification.metadata, "replyId"),
  };
}

export function getCollaborationNotificationMetadata(
  notification: NotificationItem
): CollaborationNotificationMetadata {
  if (!isRecord(notification.metadata)) return {};

  return {
    invitationId: readString(notification.metadata, "invitationId"),
    workspaceName: readString(notification.metadata, "workspaceName"),
    projectName: readString(notification.metadata, "projectName"),
    role: readString(notification.metadata, "role"),
    memberId: readString(notification.metadata, "memberId"),
    joinedUserId: readString(notification.metadata, "joinedUserId"),
  };
}

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
};

export function formatTaskStatus(status: TaskStatus | undefined): string | undefined {
  return status ? TASK_STATUS_LABELS[status] : undefined;
}

export function getNotificationSupplementalText(notification: NotificationItem): string | undefined {
  switch (notification.type) {
    case "task_assigned":
    case "task_created":
    case "task.assignment_requested":
    case "task.assignment_request_accepted":
      return getTaskAssignedMetadata(notification).taskTitle;
    case "task_status_changed": {
      const { previousStatus, currentStatus } = getTaskStatusChangedMetadata(notification);
      const from = formatTaskStatus(previousStatus);
      const to = formatTaskStatus(currentStatus);
      return from && to ? `${from} → ${to}` : undefined;
    }
    case "discussion.created":
    case "discussion.reply":
      return getDiscussionReplyMetadata(notification).discussionTitle;
    case "workspace.invitation":
    case "workspace.role_changed":
    case "workspace.member_joined": {
      const { workspaceName, role } = getCollaborationNotificationMetadata(notification);
      return role ? `${workspaceName ?? "Workspace"} · ${role}` : workspaceName;
    }
    case "project.invitation":
    case "project.role_changed":
    case "project.member_joined": {
      const { projectName, role } = getCollaborationNotificationMetadata(notification);
      return role ? `${projectName ?? "Project"} · ${role}` : projectName;
    }
    default:
      return undefined;
  }
}
