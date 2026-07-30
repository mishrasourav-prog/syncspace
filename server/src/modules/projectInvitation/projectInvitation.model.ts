import mongoose, { Document, Schema, Types } from "mongoose";

import { ProjectRole } from "../../interfaces/projectMember.interface";

export enum ProjectInvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export interface IProjectInvitationDocument extends Document {
  _id: Types.ObjectId;

  project: Types.ObjectId;

  email: string;

  invitedBy: Types.ObjectId;

  role: ProjectRole;

  status: ProjectInvitationStatus;

  expiresAt: Date;

  acceptedAt?: Date;

  rejectedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ProjectInvitationSchema = new Schema<IProjectInvitationDocument>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(ProjectRole),
      default: ProjectRole.MEMBER,
    },

    status: {
      type: String,
      enum: Object.values(ProjectInvitationStatus),
      default: ProjectInvitationStatus.PENDING,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

ProjectInvitationSchema.index(
  {
    project: 1,
    email: 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: ProjectInvitationStatus.PENDING,
    },
  },
);

ProjectInvitationSchema.index({
  project: 1,
  status: 1,
});

ProjectInvitationSchema.index({
  email: 1,
  status: 1,
});

const ProjectInvitation = mongoose.model<IProjectInvitationDocument>(
  "ProjectInvitation",
  ProjectInvitationSchema,
);

export default ProjectInvitation;
