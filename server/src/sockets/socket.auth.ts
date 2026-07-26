// import type {
//     ExtendedError,
//     Socket,
// } from "socket.io";

// import {
//     parseCookie,
// } from "cookie";

// import authService from "../modules/auth/auth.service";

// import {User} from "../modules/auth/auth.model";

// import type {
//     ClientToServerEvents,
//     InterServerEvents,
//     ServerToClientEvents,
//     SocketData,
// } from "../interfaces/socket.interface";

// type AuthenticatedSocket =
//     Socket<
//         ClientToServerEvents,
//         ServerToClientEvents,
//         InterServerEvents,
//         SocketData
//     >;

// interface SocketAuthError
//     extends ExtendedError {
//     data?: {
//         code:
//             string;
//     };
// }

// const createSocketAuthError = (
//     message:
//         string,
//     code:
//         string
// ): SocketAuthError => {
//     const error =
//         new Error(
//             message
//         ) as SocketAuthError;

//     error.data = {
//         code,
//     };

//     return error;
// };

// export const authenticateSocket =
//     async (
//         socket:
//             AuthenticatedSocket,
//         next: (
//             error?:
//                 ExtendedError
//         ) => void
//     ): Promise<void> => {
//         try {
//             /*
//             |--------------------------------------------------------------------------
//             | Read HTTP Cookie Header
//             |--------------------------------------------------------------------------
//             |
//             | HTTP-only cookies cannot be read by frontend JavaScript.
//             | The browser sends them automatically during the Socket.IO handshake.
//             |
//             */

//             const rawCookieHeader =
//                 socket.handshake
//                     .headers
//                     .cookie;

//             if (
//                 !rawCookieHeader
//             ) {
//                 return next(
//                     createSocketAuthError(
//                         "Authentication required.",
//                         "SOCKET_AUTH_REQUIRED"
//                     )
//                 );
//             }

//             const cookies =
//                 parseCookie(
//                     rawCookieHeader
//                 );

//             const accessToken =
//                 cookies.accessToken;

//             if (
//                 !accessToken
//             ) {
//                 return next(
//                     createSocketAuthError(
//                         "Authentication required.",
//                         "SOCKET_AUTH_REQUIRED"
//                     )
//                 );
//             }

//             /*
//             |--------------------------------------------------------------------------
//             | Verify Access Token
//             |--------------------------------------------------------------------------
//             */

//             const payload =
//                 await authService
//                     .verifyAccessToken(
//                         accessToken
//                     );

//             /*
//             |--------------------------------------------------------------------------
//             | Confirm User Still Exists
//             |--------------------------------------------------------------------------
//             */

//             const user =
//                 await User.findById(
//                     payload._id
//                 )
//                     .select(
//                         "_id email username"
//                     )
//                     .lean();

//             if (
//                 !user
//             ) {
//                 return next(
//                     createSocketAuthError(
//                         "User account is unavailable.",
//                         "SOCKET_USER_NOT_FOUND"
//                     )
//                 );
//             }

//             /*
//             Store trusted server-side identity for all
//             later Socket.IO event handlers.
//             */

//             socket.data.userId =
//                 user._id
//                     .toString();

//             socket.data.email =
//                 user.email;

//             socket.data.username =
//                 user.username;

//             return next();
//         } catch {
//             return next(
//                 createSocketAuthError(
//                     "Invalid or expired access token.",
//                     "SOCKET_AUTH_INVALID"
//                 )
//             );
//         }
//     };

import type {
    ExtendedError,
    Socket,
} from "socket.io";

import {
    parseCookie,
} from "cookie";

import authService from "../modules/auth/auth.service";

import {
    User,
} from "../modules/auth/auth.model";

import type {
    IJwtPayload,
} from "../interfaces/user.interface";

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
        code: string;
    };
}

const createSocketAuthError = (
    message: string,
    code: string
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

const isValidJwtPayload = (
    value: unknown
): value is IJwtPayload => {
    if (
        typeof value !== "object" ||
        value === null
    ) {
        return false;
    }

    const candidate =
        value as Partial<IJwtPayload>;

    return (
        typeof candidate._id === "string" &&
        candidate._id.length > 0 &&
        typeof candidate.email === "string" &&
        typeof candidate.username === "string" &&
        typeof candidate.sessionVersion === "number" &&
        Number.isInteger(
            candidate.sessionVersion
        ) &&
        candidate.sessionVersion >= 0
    );
};

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
            | Read the HTTP-only Access Token Cookie
            |--------------------------------------------------------------------------
            |
            | Frontend JavaScript cannot read HTTP-only cookies. The browser sends the
            | cookie header automatically during the Socket.IO handshake.
            |
            */

            const rawCookieHeader =
                socket.handshake
                    .headers
                    .cookie;

            if (!rawCookieHeader) {
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

            if (!accessToken) {
                return next(
                    createSocketAuthError(
                        "Authentication required.",
                        "SOCKET_AUTH_REQUIRED"
                    )
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Verify and Validate the JWT Payload
            |--------------------------------------------------------------------------
            |
            | Signature and expiry validation happen in authService. The explicit shape
            | check below rejects old tokens that were created before sessionVersion was
            | introduced and protects this middleware from malformed custom payloads.
            |
            */

            const decodedPayload =
                authService.verifyAccessToken(
                    accessToken
                );

            if (
                !isValidJwtPayload(
                    decodedPayload
                )
            ) {
                return next(
                    createSocketAuthError(
                        "Invalid or expired access token.",
                        "SOCKET_AUTH_INVALID"
                    )
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Confirm the Account Is Active and the Session Is Current
            |--------------------------------------------------------------------------
            |
            | deletedAt is intentionally filtered in the query rather than exposed to
            | the socket. sessionVersion is selected explicitly because the User schema
            | keeps it private by default.
            |
            */

            const user =
                await User.findOne({
                    _id:
                        decodedPayload._id,

                    deletedAt:
                        null,
                })
                    .select(
                        "_id email username +sessionVersion"
                    )
                    .lean();

            if (!user) {
                return next(
                    createSocketAuthError(
                        "User account is unavailable.",
                        "SOCKET_USER_UNAVAILABLE"
                    )
                );
            }

            const databaseSessionVersion =
                typeof user.sessionVersion === "number"
                    ? user.sessionVersion
                    : 0;

            if (
                decodedPayload.sessionVersion !==
                databaseSessionVersion
            ) {
                return next(
                    createSocketAuthError(
                        "Your session has been revoked. Please sign in again.",
                        "SOCKET_SESSION_REVOKED"
                    )
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Store Trusted Server-Side Identity
            |--------------------------------------------------------------------------
            |
            | Use current database values rather than email/username copied from the JWT.
            | This prevents stale profile data from propagating after a profile update.
            |
            */

            socket.data.userId =
                user._id.toString();

            socket.data.email =
                user.email;

            socket.data.username =
                user.username;

            socket.data.sessionVersion =
                databaseSessionVersion;

            return next();
        } catch (error) {
            console.error(
                "Socket authentication failed:",
                error
            );

            return next(
                createSocketAuthError(
                    "Invalid or expired access token.",
                    "SOCKET_AUTH_INVALID"
                )
            );
        }
    };