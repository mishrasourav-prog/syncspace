import mongoose, { type Document, Schema, Types } from "mongoose";

export interface IPendingRegistrationDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  expiresAt: Date;
  verificationSentAt: Date;
  resendWindowStartedAt: Date;
  resendCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const pendingRegistrationSchema = new Schema<IPendingRegistrationDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 5,
      maxlength: 12,
      match: [
        /^[A-Za-z0-9]+$/,
        "Username can only contain letters and numbers",
      ],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 320,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    verificationSentAt: {
      type: Date,
      required: true,
    },

    resendWindowStartedAt: {
      type: Date,
      required: true,
    },

    resendCount: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

pendingRegistrationSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);

pendingRegistrationSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
  },
);

pendingRegistrationSchema.index(
  {
    username: 1,
  },
  {
    unique: true,
  },
);

export const PendingRegistration = mongoose.model<IPendingRegistrationDocument>(
  "PendingRegistration",
  pendingRegistrationSchema,
);
