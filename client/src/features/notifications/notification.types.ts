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
  type: string;
  title: string;
  message: string;
  workspace: string | null;
  project: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}
