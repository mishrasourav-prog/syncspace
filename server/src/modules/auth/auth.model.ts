import mongoose, { Schema } from "mongoose";
import {Document , Types} from "mongoose";

export interface IUserDocument extends Document {
    _id: Types.ObjectId;
    name: string;
    username: string;
    email: string;
    password: string;
    refreshToken?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
    provider: "email" | "google" | "github";
    providerId?: string;
    lastLoginAt?: Date;
}


const userSchema = new Schema<IUserDocument>(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
      password: {
        type: String,
        minlength: 8,
        maxlength: 128,
        select: false,
        required: function () {
            return this.provider === "email";
        }
    },
      refreshToken: { type: String, default: null, select: false },
      username: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 12,
        trim: true,
        index: true,
        match: [/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers"],
        
      },
      avatar: { type: String, default: null },
      provider: { type: String, enum: ["email", "google", "facebook", "twitter", "github"], default: "email" },
      providerId: { type: String, default: null },
      lastLoginAt: { type: Date, default: null },
    },
    { timestamps: true }
  );

  export const User = mongoose.model<IUserDocument>("User", userSchema);
