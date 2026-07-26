import {
  Types,
} from "mongoose";

import type {
  IUserDocument,
} from "../modules/auth/auth.model";

import {
  User,
} from "../modules/auth/auth.model";

import ApiError from "../utils/ApiError";

/*
|--------------------------------------------------------------------------
| Active User Lookup by ID
|--------------------------------------------------------------------------
|
| Use this helper for operations that require a currently usable account:
|
| - authentication;
| - authorization;
| - membership changes;
| - task assignment;
| - invitations;
| - profile access.
|
| Deleted accounts remain stored in MongoDB so historical tasks, documents,
| comments, discussions, and activities can still populate the anonymized
| user record. They are deliberately excluded only from active operations.
|
*/

export const getUserOrThrowById =
  async (
    userId: string
  ): Promise<IUserDocument> => {
    if (
      !Types.ObjectId.isValid(
        userId
      )
    ) {
      throw new ApiError(
        404,
        "User not found."
      );
    }

    const user =
      await User.findOne({
        _id:
          userId,

        deletedAt:
          null,
      });

    if (
      !user
    ) {
      throw new ApiError(
        404,
        "User not found."
      );
    }

    return user;
  };

/*
|--------------------------------------------------------------------------
| Active User Lookup by Email
|--------------------------------------------------------------------------
*/

export const getUserOrThrowByEmail =
  async (
    emailInput: string
  ): Promise<IUserDocument> => {
    const email =
      emailInput
        .trim()
        .toLowerCase();

    const user =
      await User.findOne({
        email,

        deletedAt:
          null,
      });

    if (
      !user
    ) {
      throw new ApiError(
        404,
        "User not found."
      );
    }

    return user;
  };