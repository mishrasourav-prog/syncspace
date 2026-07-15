import type {
    ExtendedError,
    Socket,
} from "socket.io";

import authService from "../modules/auth/auth.service";

import {
    User,
} from "../modules/auth/auth.model";

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

interface ISocketAuthPayload {
    accessToken?: unknown;
}

export const authenticateSocket =
    async (
        socket: AuthenticatedSocket,
        next: (
            error?: ExtendedError
        ) => void
    ): Promise<void> => {
        try {
            /*
            |--------------------------------------------------------------------------
            | Read Token From Connection Handshake
            |--------------------------------------------------------------------------
            |
            | The frontend will connect using:
            |
            | io(API_URL, {
            |     auth: {
            |         accessToken
            |     }
            | });
            |
            */

            const auth =
                socket.handshake
                    .auth as
                    ISocketAuthPayload;

            const accessToken =
                auth.accessToken;

            if (
                typeof accessToken !==
                    "string" ||
                !accessToken
            ) {
                const error =
                    new Error(
                        "Authentication required."
                    ) as ExtendedError & {
                        data?: {
                            code: string;
                        };
                    };

                error.data = {
                    code:
                        "SOCKET_AUTH_REQUIRED",
                };

                return next(
                    error
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Verify JWT
            |--------------------------------------------------------------------------
            */

            const payload =
                await authService
                    .verifyAccessToken(
                        accessToken
                    );

            /*
            |--------------------------------------------------------------------------
            | Verify User Still Exists
            |--------------------------------------------------------------------------
            |
            | A structurally valid JWT should not be enough if the
            | user was deleted or disabled after the token was issued.
            |
            */

            const user =
                await User.findById(
                    payload._id
                )
                    .select(
                        "_id email username"
                    )
                    .lean();

            if (!user) {
                const error =
                    new Error(
                        "User account is unavailable."
                    ) as ExtendedError & {
                        data?: {
                            code: string;
                        };
                    };

                error.data = {
                    code:
                        "SOCKET_USER_NOT_FOUND",
                };

                return next(
                    error
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Store Trusted User Data
            |--------------------------------------------------------------------------
            */

            socket.data.userId =
                user._id.toString();

            socket.data.email =
                user.email;

            socket.data.username =
                user.username;

            /*
            next() without an error accepts the connection.
            */

            return next();
        } catch {
            const error =
                new Error(
                    "Invalid or expired access token."
                ) as ExtendedError & {
                    data?: {
                        code: string;
                    };
                };

            error.data = {
                code:
                    "SOCKET_AUTH_INVALID",
            };

            /*
            next(error) rejects the Socket.IO connection.
            */

            return next(
                error
            );
        }
    };