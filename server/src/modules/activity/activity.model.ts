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
        "task_created",

    TASK_STATUS_CHANGED =
        "task_status_changed",
}

export enum ActivityEntityType {
    TASK =
        "task",
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