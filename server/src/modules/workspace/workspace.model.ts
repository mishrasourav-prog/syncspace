import mongoose, { Document, Schema, Types } from "mongoose";

export interface IWorkspaceDocument extends Document {
  _id: Types.ObjectId;

  name: string;

  slug: string;

  description?: string;

  avatar?:string;

  owner: Types.ObjectId;

  timezone: string;

  settings: {
    allowGuestInvites: boolean;
    defaultRole: "member" | "guest";
    allowPublicProjects: boolean;
    allowMemberInvites:boolean;
  };

  isArchived: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspaceDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    settings: {
      allowGuestInvites: {
        type: Boolean,
        default: true,
      },

      defaultRole: {
        type: String,
        enum: ["member", "guest"],
        default: "member",
      },

      allowPublicProjects: {
        type: Boolean,
        default: false,
      },
       allowMemberInvites: {
        type: Boolean,
        default: true,
      },

    },

    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

workspaceSchema.index({
  owner: 1,
  name: 1,
});

export const Workspace = mongoose.model<IWorkspaceDocument>(
  "Workspace",
  workspaceSchema
);