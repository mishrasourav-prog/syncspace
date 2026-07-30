import mongoose, { Schema, Types, Document } from "mongoose";

export interface IProjectDocument extends Document {
  _id: Types.ObjectId;

  workspace: Types.ObjectId;

  name: string;

  slug: string;

  description: string;

  icon: string;

  createdBy: Types.ObjectId;

  settings: {
    allowMemberInvites: boolean;
    allowTaskCreation: boolean;
    allowDocumentCreation: boolean;
    allowFileUploads: boolean;
  };

  isArchived: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      maxlength: 500,
      trim: true,
    },

    icon: {
      type: String,
      default: "📁",
      maxlength: 10,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    settings: {
      allowMemberInvites: {
        type: Boolean,
        default: true,
      },

      allowTaskCreation: {
        type: Boolean,
        default: true,
      },

      allowDocumentCreation: {
        type: Boolean,
        default: true,
      },

      allowFileUploads: {
        type: Boolean,
        default: true,
      },
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

ProjectSchema.index(
  {
    workspace: 1,
    slug: 1,
  },
  {
    unique: true,
  },
);

const Project = mongoose.model<IProjectDocument>("Project", ProjectSchema);

export default Project;
