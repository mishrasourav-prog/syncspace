import type { NextFunction, Request, Response } from "express";

import type { IJwtPayload } from "../interfaces/user.interface";

import { User } from "../modules/auth/auth.model";

import authService from "../modules/auth/auth.service";

import ApiError from "../utils/ApiError";

const isValidJwtPayload = (payload: unknown): payload is IJwtPayload => {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const candidate = payload as Partial<IJwtPayload>;

  return (
    typeof candidate._id === "string" &&
    candidate._id.length > 0 &&
    typeof candidate.email === "string" &&
    typeof candidate.username === "string" &&
    Number.isInteger(candidate.sessionVersion) &&
    Number(candidate.sessionVersion) >= 0
  );
};

export const authenticateUser = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let accessToken: string | undefined;

    const cookieToken = req.cookies?.accessToken;

    if (typeof cookieToken === "string" && cookieToken.length > 0) {
      accessToken = cookieToken;
    }

    if (!accessToken && req.headers.authorization?.startsWith("Bearer ")) {
      const bearerToken = req.headers.authorization
        .slice("Bearer ".length)
        .trim();

      if (bearerToken.length > 0) {
        accessToken = bearerToken;
      }
    }

    if (!accessToken) {
      throw new ApiError(401, "Authentication required.");
    }

    const decodedPayload = await authService.verifyAccessToken(accessToken);

    if (!isValidJwtPayload(decodedPayload)) {
      throw new ApiError(401, "Invalid or expired access token.");
    }

    const user = await User.findOne({
      _id: decodedPayload._id,

      deletedAt: null,
    })
      .select("_id email username +sessionVersion")
      .lean();

    if (!user) {
      throw new ApiError(401, "User account is unavailable.");
    }

    if (user.sessionVersion !== decodedPayload.sessionVersion) {
      throw new ApiError(
        401,
        "Your session has been revoked. Please sign in again.",
      );
    }

    req.user = {
      _id: user._id.toString(),

      email: user.email,

      username: user.username,

      sessionVersion: user.sessionVersion,
    };

    next();
  } catch (error) {
    next(error);
  }
};
