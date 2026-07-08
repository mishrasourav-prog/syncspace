import { Request, Response, NextFunction } from "express";
import { User } from "../modules/auth/auth.model";
import AuthService from "../modules/auth/auth.service";
import ApiError from "../utils/ApiError";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Cookie
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // Authorization Header
    if (
      !token &&
      req.headers.authorization?.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(401, "Authentication required.");
    }

    const payload = AuthService.verifyAccessToken(token);

    const user = await User.findById(payload._id);

    if (!user) {
      throw new ApiError(401, "User no longer exists.");
    }

    req.user = {
      _id: user._id.toString(),
      email: user.email,
      username: user.username,
    };

    next();
  } catch (error) {
    next(error);
  }
};