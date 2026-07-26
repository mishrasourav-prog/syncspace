// import mongoose, { Schema } from "mongoose";
// import {Document , Types} from "mongoose";

// export interface IUserDocument extends Document {
//     _id: Types.ObjectId;
//     name: string;
//     username: string;
//     email: string;
//     password: string;
//     refreshToken?: string;
//     avatar?: string;
//     createdAt: Date;
//     updatedAt: Date;
//     provider: "email" | "google" | "github";
//     providerId?: string;
//     lastLoginAt?: Date;
// }


// const userSchema = new Schema<IUserDocument>(
//     {
//       name: { type: String, required: true },
//       email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
//       password: {
//         type: String,
//         minlength: 8,
//         maxlength: 128,
//         select: false,
//         required: function () {
//             return this.provider === "email";
//         }
//     },
//       refreshToken: { type: String, default: null, select: false },
//       username: {
//         type: String,
//         required: true,
//         unique: true,
//         minlength: 5,
//         maxlength: 12,
//         trim: true,
//         index: true,
//         match: [/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers"],
        
//       },
//       avatar: { type: String, default: null },
//       provider: { type: String, enum: ["email", "google", "facebook", "twitter", "github"], default: "email" },
//       providerId: { type: String, default: null },
//       lastLoginAt: { type: Date, default: null },
//     },
//     { timestamps: true }
//   );

//   export const User = mongoose.model<IUserDocument>("User", userSchema);


import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

import type {
  AuthProvider,
} from "../../interfaces/user.interface";

export interface IUserDocument extends Document {
  _id: Types.ObjectId;

  name: string;
  username: string;
  email: string;

  /**
   * Password is absent for provider-only accounts and is removed when an
   * account is anonymized. It is excluded from queries unless explicitly
   * selected with `+password`.
   */
  password?: string;

  /**
   * Only the currently valid refresh token is stored. It is excluded from
   * normal query results.
   */
  refreshToken?: string | null;

  avatar?: string | null;
  avatarPublicId?: string | null;

  headline?: string | null;
  bio?: string | null;
  location?: string | null;

  provider: AuthProvider;
  providerId?: string | null;

  lastLoginAt?: Date | null;
  passwordChangedAt?: Date | null;

  /**
   * Incrementing this value immediately invalidates every previously issued
   * access and refresh token for the account.
   */
  sessionVersion: number;

  /**
   * A deleted account remains as an anonymized tombstone so historical
   * project data can keep its author references without retaining personal
   * identity or authentication access.
   */
  deletedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const HTTP_URL_PATTERN = /^https?:\/\/[^\s]+$/i;
const USERNAME_PATTERN = /^[a-zA-Z0-9]+$/;

const removePrivateFields = (
  _document: unknown,
  returnedObject: Record<string, unknown>
): Record<string, unknown> => {
  delete returnedObject.password;
  delete returnedObject.refreshToken;
  delete returnedObject.providerId;
  delete returnedObject.avatarPublicId;
  delete returnedObject.passwordChangedAt;
  delete returnedObject.sessionVersion;
  delete returnedObject.deletedAt;
  delete returnedObject.__v;

  return returnedObject;
};

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 320,
      index: true,
    },

    password: {
      type: String,
      minlength: 8,
      maxlength: 128,
      select: false,
      required: function passwordRequired(
        this: IUserDocument
      ): boolean {
        return (
          this.provider === "email" &&
          this.deletedAt == null
        );
      },
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,

      /**
       * Active-profile validation will continue to enforce the public
       * 5–12-character username rule. The wider model limit allows account
       * deletion to store a unique internal alphanumeric tombstone username.
       */
      minlength: 5,
      maxlength: 64,
      index: true,
      match: [
        USERNAME_PATTERN,
        "Username can only contain letters and numbers",
      ],
    },

    avatar: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2048,
      validate: {
        validator: (
          value: string | null | undefined
        ): boolean =>
          value == null ||
          value.length === 0 ||
          HTTP_URL_PATTERN.test(value),
        message:
          "Avatar must be a valid HTTP or HTTPS URL",
      },
    },

    avatarPublicId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 512,
      select: false,
    },

    headline: {
      type: String,
      default: null,
      trim: true,
      maxlength: 80,
    },

    bio: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },

    location: {
      type: String,
      default: null,
      trim: true,
      maxlength: 120,
    },

    provider: {
      type: String,
      enum: [
        "email",
        "google",
        "facebook",
        "twitter",
        "github",
      ],
      default: "email",
      required: true,
    },

    providerId: {
      type: String,
      default: null,
      select: false,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },

    sessionVersion: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
      select: false,
      validate: {
        validator: Number.isInteger,
        message: "Session version must be an integer",
      },
    },

    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: removePrivateFields,
    },
    toObject: {
      transform: removePrivateFields,
    },
  }
);

export const User = mongoose.model<IUserDocument>(
  "User",
  userSchema
);