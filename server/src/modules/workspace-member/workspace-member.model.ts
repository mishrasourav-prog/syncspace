import mongoose, { Document, Schema, Types } from "mongoose";
import { IWorkspaceDocument } from "../workspace/workspace.model";

export enum WorkspaceRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  GUEST = "guest",
}

export interface IWorkspaceMemberDocument extends Document {
  _id: Types.ObjectId;

  workspace: Types.ObjectId | IWorkspaceDocument;

  user: Types.ObjectId;

  role: WorkspaceRole;

  joinedAt: Date;

  invitedBy?: Types.ObjectId;

  lastActiveAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

const workspaceMemberSchema =
  new Schema<IWorkspaceMemberDocument>(
    {
      workspace: {
        type: Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
        index: true,
      },

      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      role: {
        type: String,
        enum: Object.values(WorkspaceRole),
        default: WorkspaceRole.MEMBER,
      },

      joinedAt: {
        type: Date,
        default: Date.now,
      },

      invitedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      lastActiveAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );


workspaceMemberSchema.index(
  {
    workspace: 1,
    user: 1,
  },
  {
    unique: true,
  }
);


workspaceMemberSchema.index({
  workspace: 1,
  role: 1,
});


workspaceMemberSchema.index({
  user: 1,
});

export const WorkspaceMember =
  mongoose.model<IWorkspaceMemberDocument>(
    "WorkspaceMember",
    workspaceMemberSchema
  );