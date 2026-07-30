import { model, Schema, Types } from "mongoose";

export interface IProjectDocument {
  workspace: Types.ObjectId;

  project: Types.ObjectId;

  title: string;

  content: unknown;

  createdBy: Types.ObjectId;

  updatedBy: Types.ObjectId;

  revision: number;

  isArchived: boolean;

  archivedAt?: Date | null;

  archivedBy?: Types.ObjectId | null;

  createdAt: Date;

  updatedAt: Date;
}

const projectDocumentSchema = new Schema<IProjectDocument>(
  {
    workspace: {
      type: Schema.Types.ObjectId,

      ref: "Workspace",

      required: true,
    },

    project: {
      type: Schema.Types.ObjectId,

      ref: "Project",

      required: true,
    },

    title: {
      type: String,

      required: true,

      trim: true,

      maxlength: 200,
    },

    content: {
      type: Schema.Types.Mixed,

      default: null,
    },

    createdBy: {
      type: Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    revision: {
      type: Number,

      required: true,

      default: 1,

      min: 1,
    },

    isArchived: {
      type: Boolean,

      required: true,

      default: false,
    },

    archivedAt: {
      type: Date,

      default: null,
    },

    archivedBy: {
      type: Schema.Types.ObjectId,

      ref: "User",

      default: null,
    },
  },
  {
    timestamps: true,

    versionKey: false,
  },
);

projectDocumentSchema.index({
  project: 1,
  isArchived: 1,
  _id: -1,
});

projectDocumentSchema.index({
  workspace: 1,
  updatedAt: -1,
});

projectDocumentSchema.index({
  project: 1,
  title: 1,
});

const ProjectDocument = model<IProjectDocument>(
  "ProjectDocument",
  projectDocumentSchema,
);

export default ProjectDocument;
