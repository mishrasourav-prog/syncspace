import mongoose, {
    Document,
    Schema,
    Types,
} from "mongoose";


export interface ITaskAssigneeDocument extends Document {

    _id: Types.ObjectId;

    task: Types.ObjectId;

    user: Types.ObjectId;

    assignedBy: Types.ObjectId;

    assignedAt: Date;

    createdAt: Date;

    updatedAt: Date;
}

const TaskAssigneeSchema =
new Schema<ITaskAssigneeDocument>(
{
    task: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: true,
        index: true,
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    assignedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    assignedAt: {
        type: Date,
        default: Date.now,
    },
},
{
    timestamps: true,
});

TaskAssigneeSchema.index(
{
    task: 1,
    user: 1,
},
{
    unique: true,
});

const TaskAssignee = mongoose.model<ITaskAssigneeDocument>(
    "TaskAssignee",
    
TaskAssigneeSchema
);

export default TaskAssignee;