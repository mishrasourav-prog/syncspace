import type { LucideIcon } from "lucide-react";
import { CheckSquare, FileText, Lock, MessageSquare, Pin, Reply, Unlock, Zap } from "lucide-react";
import type { Activity, ActivityAction } from "./types/activity.types";

const ACTION_COPY: Record<ActivityAction, string> = {
  "task.created": "created a task",
  "task.status_changed": "changed task status",
  "document.created": "created a document",
  "document.updated": "updated a document",
  "document.archived": "archived a document",
  "document.restored": "restored a document",
  "discussion.created": "started a discussion",
  "discussion.updated": "updated a discussion",
  "discussion.deleted": "deleted a discussion",
  "discussion.pinned": "pinned a discussion",
  "discussion.unpinned": "unpinned a discussion",
  "discussion.locked": "locked a discussion",
  "discussion.unlocked": "unlocked a discussion",
  "discussion.reply_created": "replied to a discussion",
  "discussion.reply_updated": "updated a discussion reply",
  "discussion.reply_deleted": "deleted a discussion reply",
};

const ACTION_ICONS: Partial<Record<ActivityAction, LucideIcon>> = {
  "task.created": CheckSquare,
  "task.status_changed": CheckSquare,
  "document.created": FileText,
  "document.updated": FileText,
  "document.archived": FileText,
  "document.restored": FileText,
  "discussion.created": MessageSquare,
  "discussion.updated": MessageSquare,
  "discussion.deleted": MessageSquare,
  "discussion.pinned": Pin,
  "discussion.unpinned": Pin,
  "discussion.locked": Lock,
  "discussion.unlocked": Unlock,
  "discussion.reply_created": Reply,
  "discussion.reply_updated": Reply,
  "discussion.reply_deleted": Reply,
};

export function getActivityActionCopy(action: string): string {
  return ACTION_COPY[action as ActivityAction] ?? "made an update";
}

export function getActivityActionIcon(action: string): LucideIcon {
  return ACTION_ICONS[action as ActivityAction] ?? Zap;
}

export function getActivityEntityTitle(activity: Activity): string | null {
  const title = activity.metadata?.title ?? activity.metadata?.name;
  return typeof title === "string" && title.trim().length > 0 ? title : null;
}

export function getActivityStatusChange(activity: Activity): string | null {
  if (activity.action !== "task.status_changed") return null;
  const previous = activity.metadata?.previousStatus;
  const current = activity.metadata?.currentStatus;
  if (typeof previous === "string" && typeof current === "string") {
    return `${previous} → ${current}`;
  }
  return null;
}
