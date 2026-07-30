import mongoose, { Schema, Document } from "mongoose";

export enum OtpPurpose {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
  LOGIN = "LOGIN",
}

export interface IOtpDocument extends Document {
  email: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  purpose: OtpPurpose;
  isVerified: boolean;
}

const otpSchema = new Schema<IOtpDocument>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0, min: 0 },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0,
    },
    purpose: {
      type: String,
      enum: Object.values(OtpPurpose),
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

otpSchema.index(
  {
    email: 1,
    purpose: 1,
  },
  {
    unique: true,
  },
);

export const Otp = mongoose.model<IOtpDocument>("Otp", otpSchema);
