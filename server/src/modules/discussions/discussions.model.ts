import {
    model,
    Schema,
    Types,
} from "mongoose";

export interface IDiscussion {
    workspace: Types.ObjectId;

    project: Types.ObjectId;

    title: string;

    body: string;

    author: Types.ObjectId;

    isPinned: boolean;

    isLocked: boolean;

    isDeleted: boolean;

    deletedAt?: Date | null;

    deletedBy?: Types.ObjectId | null;

    createdAt: Date;

    updatedAt: Date;
}

const discussionSchema =
    new Schema<IDiscussion>(
        {
            workspace: {
                type:
                    Schema.Types.ObjectId,

                ref:
                    "Workspace",

                required:
                    true,
            },

            project: {
                type:
                    Schema.Types.ObjectId,

                ref:
                    "Project",

                required:
                    true,
            },

            title: {
                type:
                    String,

                required:
                    true,

                trim:
                    true,

                maxlength:
                    200,
            },

            body: {
                type:
                    String,

                required:
                    true,

                trim:
                    true,

                maxlength:
                    10_000,
            },

            author: {
                type:
                    Schema.Types.ObjectId,

                ref:
                    "User",

                required:
                    true,
            },

            isPinned: {
                type:
                    Boolean,

                default:
                    false,

                required:
                    true,
            },

            isLocked: {
                type:
                    Boolean,

                default:
                    false,

                required:
                    true,
            },

            isDeleted: {
                type:
                    Boolean,

                default:
                    false,

                required:
                    true,
            },

            deletedAt: {
                type:
                    Date,

                default:
                    null,
            },

            deletedBy: {
                type:
                    Schema.Types.ObjectId,

                ref:
                    "User",

                default:
                    null,
            },
        },
        {
            timestamps:
                true,

            versionKey:
                false,
        }
    );

discussionSchema.index({
    project: 1,
    isDeleted: 1,
    _id: -1,
});

discussionSchema.index({
    project: 1,
    isPinned: 1,
    updatedAt: -1,
});

discussionSchema.index({
    author: 1,
    createdAt: -1,
});

const Discussion =
    model<IDiscussion>(
        "Discussion",
        discussionSchema
    );

export default Discussion;