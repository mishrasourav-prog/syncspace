import type {
    ExtendedError,
    Socket,
} from "socket.io";

import {
    parseCookie,
} from "cookie";

import authService from "../modules/auth/auth.service";

import {User} from "../modules/auth/auth.model";

import type {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from "../interfaces/socket.interface";

type AuthenticatedSocket =
    Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >;

interface SocketAuthError
    extends ExtendedError {
    data?: {
        code:
            string;
    };
}

const createSocketAuthError = (
    message:
        string,
    code:
        string
): SocketAuthError => {
    const error =
        new Error(
            message
        ) as SocketAuthError;

    error.data = {
        code,
    };

    return error;
};

export const authenticateSocket =
    async (
        socket:
            AuthenticatedSocket,
        next: (
            error?:
                ExtendedError
        ) => void
    ): Promise<void> => {
        try {
            /*
            |--------------------------------------------------------------------------
            | Read HTTP Cookie Header
            |--------------------------------------------------------------------------
            |
            | HTTP-only cookies cannot be read by frontend JavaScript.
            | The browser sends them automatically during the Socket.IO handshake.
            |
            */

            const rawCookieHeader =
                socket.handshake
                    .headers
                    .cookie;

            if (
                !rawCookieHeader
            ) {
                return next(
                    createSocketAuthError(
                        "Authentication required.",
                        "SOCKET_AUTH_REQUIRED"
                    )
                );
            }

            const cookies =
                parseCookie(
                    rawCookieHeader
                );

            const accessToken =
                cookies.accessToken;

            if (
                !accessToken
            ) {
                return next(
                    createSocketAuthError(
                        "Authentication required.",
                        "SOCKET_AUTH_REQUIRED"
                    )
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Verify Access Token
            |--------------------------------------------------------------------------
            */

            const payload =
                await authService
                    .verifyAccessToken(
                        accessToken
                    );

            /*
            |--------------------------------------------------------------------------
            | Confirm User Still Exists
            |--------------------------------------------------------------------------
            */

            const user =
                await User.findById(
                    payload._id
                )
                    .select(
                        "_id email username"
                    )
                    .lean();

            if (
                !user
            ) {
                return next(
                    createSocketAuthError(
                        "User account is unavailable.",
                        "SOCKET_USER_NOT_FOUND"
                    )
                );
            }

            /*
            Store trusted server-side identity for all
            later Socket.IO event handlers.
            */

            socket.data.userId =
                user._id
                    .toString();

            socket.data.email =
                user.email;

            socket.data.username =
                user.username;

            return next();
        } catch {
            return next(
                createSocketAuthError(
                    "Invalid or expired access token.",
                    "SOCKET_AUTH_INVALID"
                )
            );
        }
    };