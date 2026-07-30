import type {
  NotificationEntityType,
  NotificationType,
} from "../modules/notifications/notification.model";

export interface INotificationActor {
  _id: string;

  name: string;

  username: string;

  avatar?: string;
}

export interface INotificationResponse {
  _id: string;

  recipient: string;

  actor: INotificationActor | null;

  type: NotificationType;

  title: string;

  message: string;

  workspace: string | null;

  project: string | null;

  entityType: NotificationEntityType | null;

  entityId: string | null;

  metadata: Record<string, unknown>;

  isRead: boolean;

  readAt: Date | null;

  createdAt: Date;
}

export interface INotificationsResponse {
  notifications: INotificationResponse[];
}

export interface IUnreadNotificationCountResponse {
  unreadCount: number;
}
