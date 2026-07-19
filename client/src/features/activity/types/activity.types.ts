export type ActivityAction =
  | "task.created"
  | "task.status_changed"
  | "document.created"
  | "document.updated"
  | "document.archived"
  | "document.restored"
  | "discussion.created"
  | "discussion.updated"
  | "discussion.deleted"
  | "discussion.pinned"
  | "discussion.unpinned"
  | "discussion.locked"
  | "discussion.unlocked"
  | "discussion.reply_created"
  | "discussion.reply_updated"
  | "discussion.reply_deleted";

export type ActivityEntityType = "task" | "document" | "discussion" | "discussion_reply";

export interface ActivityActor {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface Activity {
  _id: string;
  workspace: string;
  project: string;
  actor: ActivityActor | null;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
