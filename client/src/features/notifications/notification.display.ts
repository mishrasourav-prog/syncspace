import type { NotificationFilter, NotificationItem, NotificationType } from "./notification.types";
import {
  getDiscussionReplyMetadata,
  getTaskAssignedMetadata,
} from "./notification.metadata";

const TYPE_LABELS: Record<NotificationType, string> = {
  task_assigned: "Task assigned",
  task_status_changed: "Task status changed",
  "discussion.reply": "Discussion reply",
};

/** Normalized, human-readable label for a notification type. */
export function getNotificationTypeLabel(notification: NotificationItem): string {
  const { taskType } = notification.type === "task_assigned" ? getTaskAssignedMetadata(notification) : {};

  if (notification.type === "task_assigned") {
    return taskType === "issue" ? "Issue assigned" : "Task assigned";
  }

  return TYPE_LABELS[notification.type] ?? notification.type;
}

/** Safe display name for the notification's actor, falling back to "System" when unavailable. */
export function getNotificationActorName(notification: NotificationItem): string {
  return notification.actor?.name ?? "System";
}

const MAX_SEARCH_LENGTH = 200;

/** Case-insensitive, trimmed, length-constrained search predicate over the fields the spec allows searching. */
export function matchesNotificationSearch(notification: NotificationItem, rawQuery: string): boolean {
  const query = rawQuery.trim().slice(0, MAX_SEARCH_LENGTH).toLowerCase();
  if (!query) return true;

  const haystack = [
    notification.title,
    notification.message,
    notification.actor?.name,
    notification.actor?.username,
    getNotificationTypeLabel(notification),
    notification.type === "discussion.reply" ? getDiscussionReplyMetadata(notification).discussionTitle : undefined,
    notification.type !== "discussion.reply" ? getTaskAssignedMetadata(notification).taskTitle : undefined,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

/** Pure client-side filter predicate matching the spec's supported filters exactly. */
export function matchesNotificationFilter(notification: NotificationItem, filter: NotificationFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "unread":
      return notification.isRead === false;
    case "tasks":
      return notification.type === "task_assigned" || notification.type === "task_status_changed";
    case "discussions":
      return notification.type === "discussion.reply";
    case "read":
      return notification.isRead === true;
    default:
      return true;
  }
}
