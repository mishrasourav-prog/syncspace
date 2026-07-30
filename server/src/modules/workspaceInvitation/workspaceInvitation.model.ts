import mongoose, { Schema, Document, Types } from "mongoose";

export enum InvitationRole {
  ADMIN = "admin",
  MEMBER = "member",
  GUEST = "guest",
}

export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export interface IWorkspaceInvitationDocument extends Document {
  _id: Types.ObjectId;

  workspace: Types.ObjectId;

  email: string;

  invitedBy: Types.ObjectId;

  role: InvitationRole;

  status: InvitationStatus;

  expiresAt: Date;

  acceptedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

const WorkspaceInvitationSchema = new Schema<IWorkspaceInvitationDocument>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(InvitationRole),
      default: InvitationRole.MEMBER,
    },

    status: {
      type: String,
      enum: Object.values(InvitationStatus),
      default: InvitationStatus.PENDING,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    acceptedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

WorkspaceInvitationSchema.index({
  workspace: 1,
  email: 1,
  status: 1,
});

WorkspaceInvitationSchema.index({
  expiresAt: 1,
});

export const WorkspaceInvitation = mongoose.model<IWorkspaceInvitationDocument>(
  "WorkspaceInvitation",
  WorkspaceInvitationSchema,
);
