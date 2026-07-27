import { getTaskAssignedMetadata } from "./notification.metadata";
import type { NotificationItem } from "./notification.types";

export interface NotificationDestination {
  path: string;
  label: string;
}

/**
 * Pure helper that returns the one supported navigation destination for a notification,
 * or null when the notification does not carry enough safe information to navigate.
 * Does not consider workspace/project access — callers should also check access availability.
 */
export function getNotificationDestination(notification: NotificationItem): NotificationDestination | null {
  if (!notification.workspace || !notification.project) return null;

  if (notification.entityType === "task" && notification.entityId) {
    const { taskType } = getTaskAssignedMetadata(notification);
    return {
      path: `/workspaces/${notification.workspace}/projects/${notification.project}/tasks/${notification.entityId}`,
      label: taskType === "issue" ? "View Issue" : "View Task",
    };
  }

  if (notification.entityType === "discussion" && notification.entityId) {
    return {
      path: `/workspaces/${notification.workspace}/projects/${notification.project}/discussions/${notification.entityId}`,
      label: "View Discussion",
    };
  }

  return null;
}
