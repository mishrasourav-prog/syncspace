import mongoose, { Schema, Types, Document } from "mongoose";


import { ProjectRole } from "../../interfaces/projectMember.interface";

export interface IProjectMemberDocument extends Document {
    _id: Types.ObjectId;

    project: Types.ObjectId;

    user: Types.ObjectId;

    role: ProjectRole;

    joinedAt: Date;

    createdAt: Date;

    updatedAt: Date;
}

const ProjectMemberSchema = new Schema<IProjectMemberDocument>(
    {
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
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
            enum: ProjectRole,
            default: ProjectRole.MEMBER,
        },

        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

ProjectMemberSchema.index(
    {
        project: 1,
        user: 1,
    },
    {
        unique: true,
    }
);

const ProjectMember = mongoose.model<IProjectMemberDocument>(
    "ProjectMember",
    ProjectMemberSchema
);

export default ProjectMember;