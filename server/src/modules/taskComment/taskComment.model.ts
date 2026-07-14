import mongoose, {
    Document,
    Schema,
    Types,
} from "mongoose";

export interface ITaskCommentDocument extends Document {

    _id: Types.ObjectId;

    task: Types.ObjectId;

    author: Types.ObjectId;

    body: string;

    isEdited: boolean;

    editedAt?: Date;

    isDeleted: boolean;

    createdAt: Date;

    updatedAt: Date;

    deletedAt?: Date;

    deletedBy?: Types.ObjectId;
}

const TaskCommentSchema =
new Schema<ITaskCommentDocument>(
{
    task: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: true,
        index: true,
    },

    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    body: {
    type: String,
    trim: true,
    maxlength: 10000,

    validate: {
        validator: function (
            this: ITaskCommentDocument,
            value: string
        ) {
            return this.isDeleted || value.length > 0;
        },

        message: "Comment body cannot be empty.",
    },
},

    isEdited: {
        type: Boolean,
        default: false,
    },

    editedAt: {
        type: Date,
        default:undefined
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default:undefined
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default:undefined
    },
    
},
{
    timestamps: true,
    optimisticConcurrency:true
}
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

TaskCommentSchema.index({
    task: 1,
    createdAt: 1,
    _id:1
});

TaskCommentSchema.index({
    author: 1,
});

const TaskComment =
mongoose.model<ITaskCommentDocument>(
    "TaskComment",
    TaskCommentSchema
);

export default TaskComment;