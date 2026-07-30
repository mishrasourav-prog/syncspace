import mongoose, { Schema, Types, type Document } from "mongoose";

export enum TaskAssignmentRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
}

export interface ITaskAssignmentRequestDocument extends Document {
  _id: Types.ObjectId;
  task: Types.ObjectId;
  requester: Types.ObjectId;
  status: TaskAssignmentRequestStatus;
  acceptedBy?: Types.ObjectId;
  requestedAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskAssignmentRequestSchema = new Schema<ITaskAssignmentRequestDocument>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskAssignmentRequestStatus),
      default: TaskAssignmentRequestStatus.PENDING,
      required: true,
      index: true,
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    acceptedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

taskAssignmentRequestSchema.index(
  { task: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: TaskAssignmentRequestStatus.PENDING,
    },
  },
);

taskAssignmentRequestSchema.index({ task: 1, status: 1, requestedAt: 1 });

const TaskAssignmentRequest = mongoose.model<ITaskAssignmentRequestDocument>(
  "TaskAssignmentRequest",
  taskAssignmentRequestSchema,
);

export default TaskAssignmentRequest;
