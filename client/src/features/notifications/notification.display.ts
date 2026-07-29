import type { NotificationFilter, NotificationItem, NotificationType } from "./notification.types";
import {
  getCollaborationNotificationMetadata,
  getDiscussionReplyMetadata,
  getTaskAssignedMetadata,
} from "./notification.metadata";

const TYPE_LABELS: Record<NotificationType, string> = {
  task_assigned: "Task assigned",
  task_status_changed: "Task status changed",
  task_created: "Task created",
  "task.assignment_requested": "Admin assignment requested",
  "task.assignment_request_accepted": "Assignment request accepted",
  "discussion.created": "Discussion started",
  "discussion.reply": "Discussion reply",
  "workspace.invitation": "Workspace invitation",
  "project.invitation": "Project invitation",
  "workspace.role_changed": "Workspace role changed",
  "project.role_changed": "Project role changed",
  "workspace.member_joined": "Workspace member joined",
  "project.member_joined": "Project member joined",
};

export function getNotificationTypeLabel(notification: NotificationItem): string {
  if (notification.type === "task_assigned") {
    return getTaskAssignedMetadata(notification).taskType === "issue"
      ? "Issue assigned"
      : "Task assigned";
  }

  if (notification.type === "task_created") {
    return getTaskAssignedMetadata(notification).taskType === "issue"
      ? "Issue created"
      : "Task created";
  }

  return TYPE_LABELS[notification.type] ?? notification.type;
}

export function getNotificationActorName(notification: NotificationItem): string {
  return notification.actor?.name ?? "System";
}

export function isInvitationNotification(notification: NotificationItem): boolean {
  return (
    notification.type === "workspace.invitation" ||
    notification.type === "project.invitation"
  );
}

const MAX_SEARCH_LENGTH = 200;

export function matchesNotificationSearch(notification: NotificationItem, rawQuery: string): boolean {
  const query = rawQuery.trim().slice(0, MAX_SEARCH_LENGTH).toLowerCase();
  if (!query) return true;

  const collaboration = getCollaborationNotificationMetadata(notification);
  const haystack = [
    notification.title,
    notification.message,
    notification.actor?.name,
    notification.actor?.username,
    getNotificationTypeLabel(notification),
    notification.type === "discussion.reply" || notification.type === "discussion.created"
      ? getDiscussionReplyMetadata(notification).discussionTitle
      : undefined,
    notification.type.startsWith("task_") || notification.type.startsWith("task.")
      ? getTaskAssignedMetadata(notification).taskTitle
      : undefined,
    collaboration.workspaceName,
    collaboration.projectName,
    collaboration.role,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function matchesNotificationFilter(notification: NotificationItem, filter: NotificationFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "unread":
      return notification.isRead === false;
    case "tasks":
      return notification.type.startsWith("task_") || notification.type.startsWith("task.");
    case "discussions":
      return notification.type === "discussion.created" || notification.type === "discussion.reply";
    case "read":
      return notification.isRead === true;
    default:
      return true;
  }
}
