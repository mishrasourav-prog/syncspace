import { Types } from "mongoose";

import type { IUserDocument } from "../modules/auth/auth.model";

import { User } from "../modules/auth/auth.model";

import ApiError from "../utils/ApiError";

export const getUserOrThrowById = async (
  userId: string,
): Promise<IUserDocument> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(404, "User not found.");
  }

  const user = await User.findOne({
    _id: userId,

    deletedAt: null,
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user;
};

export const getUserOrThrowByEmail = async (
  emailInput: string,
): Promise<IUserDocument> => {
  const email = emailInput.trim().toLowerCase();

  const user = await User.findOne({
    email,

    deletedAt: null,
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user;
};
