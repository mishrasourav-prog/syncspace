import {
    model,
    Schema,
    Types,
} from "mongoose";

export interface IDiscussionReply {
    workspace: Types.ObjectId;

    project: Types.ObjectId;

    discussion: Types.ObjectId;

    author: Types.ObjectId;

    body: string;

    isDeleted: boolean;

    deletedAt?: Date | null;

    deletedBy?: Types.ObjectId | null;

    createdAt: Date;

    updatedAt: Date;
}

const discussionReplySchema =
    new Schema<IDiscussionReply>(
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

            discussion: {
                type:
                    Schema.Types.ObjectId,

                ref:
                    "Discussion",

                required:
                    true,
            },

            author: {
                type:
                    Schema.Types.ObjectId,

                ref:
                    "User",

                required:
                    true,
            },

            body: {
                type:
                    String,

                required:
                    true,

                trim:
                    true,

                maxlength:
                    5000,
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

discussionReplySchema.index({
    discussion: 1,
    _id: 1,
});

discussionReplySchema.index({
    author: 1,
    createdAt: -1,
});

const DiscussionReply =
    model<IDiscussionReply>(
        "DiscussionReply",
        discussionReplySchema
    );

export default DiscussionReply;