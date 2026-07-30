import { model, Schema, Types } from "mongoose";

import type { Document } from "mongoose";

export enum NotificationType {
  TASK_CREATED = "task_created",

  TASK_ASSIGNED = "task_assigned",

  TASK_STATUS_CHANGED = "task_status_changed",

  TASK_ASSIGNMENT_REQUESTED = "task.assignment_requested",

  TASK_ASSIGNMENT_REQUEST_ACCEPTED = "task.assignment_request_accepted",

  DISCUSSION_CREATED = "discussion.created",

  DISCUSSION_REPLY = "discussion.reply",

  WORKSPACE_INVITATION = "workspace.invitation",

  PROJECT_INVITATION = "project.invitation",

  WORKSPACE_ROLE_CHANGED = "workspace.role_changed",

  PROJECT_ROLE_CHANGED = "project.role_changed",

  WORKSPACE_MEMBER_JOINED = "workspace.member_joined",

  PROJECT_MEMBER_JOINED = "project.member_joined",
}

export enum NotificationEntityType {
  TASK = "task",

  DISCUSSION = "discussion",

  WORKSPACE = "workspace",

  PROJECT = "project",

  WORKSPACE_INVITATION = "workspace_invitation",

  PROJECT_INVITATION = "project_invitation",
}

export interface INotificationDocument extends Document {
  _id: Types.ObjectId;

  recipient: Types.ObjectId;

  actor?: Types.ObjectId;

  type: NotificationType;

  title: string;

  message: string;

  workspace?: Types.ObjectId;

  project?: Types.ObjectId;

  entityType?: NotificationEntityType;

  entityId?: Types.ObjectId;

  metadata: Record<string, unknown>;

  isRead: boolean;

  readAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,

      ref: "User",

      required: true,

      index: true,
    },

    actor: {
      type: Schema.Types.ObjectId,

      ref: "User",
    },

    type: {
      type: String,

      enum: Object.values(NotificationType),

      required: true,
    },

    title: {
      type: String,

      required: true,

      trim: true,
    },

    message: {
      type: String,

      required: true,

      trim: true,
    },

    workspace: {
      type: Schema.Types.ObjectId,

      ref: "Workspace",
    },

    project: {
      type: Schema.Types.ObjectId,

      ref: "Project",
    },

    entityType: {
      type: String,

      enum: Object.values(NotificationEntityType),
    },

    entityId: {
      type: Schema.Types.ObjectId,
    },

    metadata: {
      type: Schema.Types.Mixed,

      default: {},
    },

    isRead: {
      type: Boolean,

      default: false,

      index: true,
    },

    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,

    versionKey: false,
  },
);

notificationSchema.index({
  recipient: 1,

  createdAt: -1,

  _id: -1,
});

notificationSchema.index({
  recipient: 1,

  isRead: 1,

  createdAt: -1,
});

const Notification = model<INotificationDocument>(
  "Notification",
  notificationSchema,
);

export default Notification;
