import type { ExtendedError, Socket } from "socket.io";

import { parseCookie } from "cookie";

import authService from "../modules/auth/auth.service";

import { User } from "../modules/auth/auth.model";

import type { IJwtPayload } from "../interfaces/user.interface";

import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../interfaces/socket.interface";

type AuthenticatedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

interface SocketAuthError extends ExtendedError {
  data?: {
    code: string;
  };
}

const createSocketAuthError = (
  message: string,
  code: string,
): SocketAuthError => {
  const error = new Error(message) as SocketAuthError;

  error.data = {
    code,
  };

  return error;
};

const isValidJwtPayload = (value: unknown): value is IJwtPayload => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<IJwtPayload>;

  return (
    typeof candidate._id === "string" &&
    candidate._id.length > 0 &&
    typeof candidate.email === "string" &&
    typeof candidate.username === "string" &&
    typeof candidate.sessionVersion === "number" &&
    Number.isInteger(candidate.sessionVersion) &&
    candidate.sessionVersion >= 0
  );
};

export const authenticateSocket = async (
  socket: AuthenticatedSocket,
  next: (error?: ExtendedError) => void,
): Promise<void> => {
  try {
    const rawCookieHeader = socket.handshake.headers.cookie;

    if (!rawCookieHeader) {
      return next(
        createSocketAuthError(
          "Authentication required.",
          "SOCKET_AUTH_REQUIRED",
        ),
      );
    }

    const cookies = parseCookie(rawCookieHeader);

    const accessToken = cookies.accessToken;

    if (!accessToken) {
      return next(
        createSocketAuthError(
          "Authentication required.",
          "SOCKET_AUTH_REQUIRED",
        ),
      );
    }

    const decodedPayload = authService.verifyAccessToken(accessToken);

    if (!isValidJwtPayload(decodedPayload)) {
      return next(
        createSocketAuthError(
          "Invalid or expired access token.",
          "SOCKET_AUTH_INVALID",
        ),
      );
    }

    const user = await User.findOne({
      _id: decodedPayload._id,

      deletedAt: null,
    })
      .select("_id email username +sessionVersion")
      .lean();

    if (!user) {
      return next(
        createSocketAuthError(
          "User account is unavailable.",
          "SOCKET_USER_UNAVAILABLE",
        ),
      );
    }

    const databaseSessionVersion =
      typeof user.sessionVersion === "number" ? user.sessionVersion : 0;

    if (decodedPayload.sessionVersion !== databaseSessionVersion) {
      return next(
        createSocketAuthError(
          "Your session has been revoked. Please sign in again.",
          "SOCKET_SESSION_REVOKED",
        ),
      );
    }

    socket.data.userId = user._id.toString();

    socket.data.email = user.email;

    socket.data.username = user.username;

    socket.data.sessionVersion = databaseSessionVersion;

    return next();
  } catch (error) {
    console.error("Socket authentication failed:", error);

    return next(
      createSocketAuthError(
        "Invalid or expired access token.",
        "SOCKET_AUTH_INVALID",
      ),
    );
  }
};
