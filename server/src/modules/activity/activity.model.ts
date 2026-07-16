import {
    model,
    Schema,
    Types,
} from "mongoose";

import type {
    Document,
} from "mongoose";

export enum ActivityAction {
    TASK_CREATED =
        "task.created",

    TASK_STATUS_CHANGED =
        "task.status_changed",

    DOCUMENT_CREATED =
        "document.created",

    DOCUMENT_UPDATED =
        "document.updated",

    DOCUMENT_ARCHIVED =
        "document.archived",

    DOCUMENT_RESTORED =
        "document.restored",

        DISCUSSION_CREATED =
        "discussion.created",

    DISCUSSION_UPDATED =
        "discussion.updated",

    DISCUSSION_DELETED =
        "discussion.deleted",

    DISCUSSION_PINNED =
        "discussion.pinned",

    DISCUSSION_UNPINNED =
        "discussion.unpinned",

    DISCUSSION_LOCKED =
        "discussion.locked",

    DISCUSSION_UNLOCKED =
        "discussion.unlocked",

    DISCUSSION_REPLY_CREATED =
        "discussion.reply_created",

    DISCUSSION_REPLY_UPDATED =
        "discussion.reply_updated",

    DISCUSSION_REPLY_DELETED =
        "discussion.reply_deleted",
}

export enum ActivityEntityType {
    TASK =
        "task",

    DOCUMENT =
        "document",

     DISCUSSION =
        "discussion",

    DISCUSSION_REPLY =
        "discussion_reply",
}
export interface IActivityDocument
    extends Document {
    _id:
        Types.ObjectId;

    workspace:
        Types.ObjectId;

    project:
        Types.ObjectId;

    actor:
        Types.ObjectId;

    action:
        ActivityAction;

    entityType:
        ActivityEntityType;

    entityId:
        Types.ObjectId;

    metadata:
        Record<
            string,
            unknown
        >;

    createdAt:
        Date;

    updatedAt:
        Date;
}

const activitySchema =
    new Schema<IActivityDocument>(
        {
            workspace: {
                type:
                    Schema.Types.ObjectId,

                ref:
                    "Workspace",

                required:
                    true,

                index:
                    true,
            },

            project: {
                type:
                    Schema.Types.ObjectId,

                ref:
                    "Project",

                required:
                    true,

                index:
                    true,
            },

            actor: {
                type:
                    Schema.Types.ObjectId,

                ref:
                    "User",

                required:
                    true,

                index:
                    true,
            },

            action: {
                type:
                    String,

                enum:
                    Object.values(
                        ActivityAction
                    ),

                required:
                    true,
            },

            entityType: {
                type:
                    String,

                enum:
                    Object.values(
                        ActivityEntityType
                    ),

                required:
                    true,
            },

            entityId: {
                type:
                    Schema.Types.ObjectId,

                required:
                    true,

                index:
                    true,
            },

            metadata: {
                type:
                    Schema.Types.Mixed,

                default:
                    {},
            },
        },
        {
            timestamps:
                true,

            versionKey:
                false,
        }
    );

activitySchema.index({
    project:
        1,

    createdAt:
        -1,

    _id:
        -1,
});

activitySchema.index({
    workspace:
        1,

    createdAt:
        -1,

    _id:
        -1,
});

const Activity =
    model<IActivityDocument>(
        "Activity",
        activitySchema
    );

export default Activity;