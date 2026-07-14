import mongoose, {
    Document,
    Schema,
    Types,
} from "mongoose";

export enum TaskStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE",
}

export enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT",
}

export interface ITaskDocument extends Document {
    _id: Types.ObjectId;

    project: Types.ObjectId;

    title: string;

    description: string;

    status: TaskStatus;

    priority: TaskPriority;

    createdBy: Types.ObjectId;

    updatedBy?: Types.ObjectId;

    completedBy?: Types.ObjectId;

    startDate?: Date;

    dueDate?: Date;

    completedAt?: Date;

    parentTask?: Types.ObjectId;

    position: number;

    isArchived: boolean;

    createdAt: Date;

    updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDocument>(
    {
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: Object.values(TaskStatus),
            default: TaskStatus.TODO,
        },

        priority: {
            type: String,
            enum: Object.values(TaskPriority),
            default: TaskPriority.MEDIUM,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        completedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        startDate: {
            type: Date,
        },

        dueDate: {
            type: Date,
        },

        completedAt: {
            type: Date,
        },

        parentTask: {
            type: Schema.Types.ObjectId,
            ref: "Task",
        },

        position: {
            type: Number,
            default: 1000,
        },

        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

TaskSchema.index({
    project: 1,
    status: 1,
});

TaskSchema.index({
    project: 1,
    position: 1,
});

TaskSchema.index({
    project: 1,
    dueDate: 1,
});

TaskSchema.index({
    parentTask: 1,
});

TaskSchema.index({
    createdBy: 1,
});

const Task = mongoose.model<ITaskDocument>(
    "Task",
    TaskSchema
);

export default Task;