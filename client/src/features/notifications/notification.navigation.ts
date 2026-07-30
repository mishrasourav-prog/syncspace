import {
  getDiscussionReplyMetadata,
  getTaskAssignedMetadata,
} from "./notification.metadata";
import type { NotificationItem } from "./notification.types";

export interface NotificationDestination {
  path: string;
  label: string;
  requiresResourceAccess: boolean;
}

export function getNotificationDestination(
  notification: NotificationItem,
): NotificationDestination | null {
  if (notification.entityType === "workspace_invitation") {
    return {
      path: "/dashboard#invitations",
      label: "Review workspace invitation",
      requiresResourceAccess: false,
    };
  }

  if (notification.entityType === "project_invitation") {
    return {
      path: "/dashboard#project-invitations",
      label: "Review project invitation",
      requiresResourceAccess: false,
    };
  }

  if (notification.entityType === "workspace" && notification.workspace) {
    return {
      path: `/workspaces/${notification.workspace}`,
      label: "Open workspace",
      requiresResourceAccess: true,
    };
  }

  if (
    notification.entityType === "project" &&
    notification.workspace &&
    notification.project
  ) {
    return {
      path: `/workspaces/${notification.workspace}/projects/${notification.project}`,
      label: "Open project",
      requiresResourceAccess: true,
    };
  }

  if (!notification.workspace || !notification.project) return null;

  if (notification.entityType === "task" && notification.entityId) {
    const { taskType } = getTaskAssignedMetadata(notification);
    return {
      path: `/workspaces/${notification.workspace}/projects/${notification.project}/tasks/${notification.entityId}`,
      label: taskType === "issue" ? "View issue" : "View task",
      requiresResourceAccess: true,
    };
  }

  if (notification.entityType === "discussion" && notification.entityId) {
    const { replyId } = getDiscussionReplyMetadata(notification);
    const replyHash = replyId ? `#reply-${replyId}` : "";

    return {
      path: `/workspaces/${notification.workspace}/projects/${notification.project}/discussions/${notification.entityId}${replyHash}`,
      label: replyId ? "View reply" : "View discussion",
      requiresResourceAccess: true,
    };
  }

  return null;
}
