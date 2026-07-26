// import { Request, Response, NextFunction } from "express";
// import { User } from "../modules/auth/auth.model";
// import AuthService from "../modules/auth/auth.service";
// import ApiError from "../utils/ApiError";

// export const authenticateUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     let token: string | undefined;

//     // Cookie
//     if (req.cookies?.accessToken) {
//       token = req.cookies.accessToken;
//     }

//     // Authorization Header
//     if (
//       !token &&
//       req.headers.authorization?.startsWith("Bearer ")
//     ) {
//       token = req.headers.authorization.split(" ")[1];
//     }

//     if (!token) {
//       throw new ApiError(401, "Authentication required.");
//     }

//     const payload = AuthService.verifyAccessToken(token);

//     const user = await User.findById(payload._id);

//     if (!user) {
//       throw new ApiError(401, "User no longer exists.");
//     }

//     req.user = {
//       _id: user._id.toString(),
//       email: user.email,
//       username: user.username,
//     };

//     next();
//   } catch (error) {
//     next(error);
//   }
// };

import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type {
  IJwtPayload,
} from "../interfaces/user.interface";

import {
  User,
} from "../modules/auth/auth.model";

import authService from "../modules/auth/auth.service";

import ApiError from "../utils/ApiError";

/*
|--------------------------------------------------------------------------
| JWT Payload Guard
|--------------------------------------------------------------------------
|
| Tokens issued before the session-version security upgrade do not contain
| sessionVersion. They must be rejected so the user signs in again and
| receives a token using the current secure payload format.
|
*/

const isValidJwtPayload = (
  payload: unknown
): payload is IJwtPayload => {
  if (
    typeof payload !== "object" ||
    payload === null
  ) {
    return false;
  }

  const candidate =
    payload as Partial<IJwtPayload>;

  return (
    typeof candidate._id === "string" &&
    candidate._id.length > 0 &&
    typeof candidate.email === "string" &&
    typeof candidate.username === "string" &&
    Number.isInteger(
      candidate.sessionVersion
    ) &&
    Number(
      candidate.sessionVersion
    ) >= 0
  );
};

/*
|--------------------------------------------------------------------------
| Authenticate Protected HTTP Requests
|--------------------------------------------------------------------------
|
| Supported token sources:
|
| 1. HTTP-only accessToken cookie
| 2. Authorization: Bearer <token>
|
| The cookie remains the primary browser authentication mechanism. Bearer
| support is preserved for API clients and existing project behavior.
|
*/

export const authenticateUser =
  async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      let accessToken:
        string |
        undefined;

      /*
      |--------------------------------------------------------------------------
      | Read Access Token
      |--------------------------------------------------------------------------
      */

      const cookieToken =
        req.cookies?.accessToken;

      if (
        typeof cookieToken ===
          "string" &&
        cookieToken.length > 0
      ) {
        accessToken =
          cookieToken;
      }

      if (
        !accessToken &&
        req.headers.authorization
          ?.startsWith(
            "Bearer "
          )
      ) {
        const bearerToken =
          req.headers.authorization
            .slice(
              "Bearer ".length
            )
            .trim();

        if (
          bearerToken.length > 0
        ) {
          accessToken =
            bearerToken;
        }
      }

      if (
        !accessToken
      ) {
        throw new ApiError(
          401,
          "Authentication required."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Verify JWT Structure and Signature
      |--------------------------------------------------------------------------
      */

      const decodedPayload =
        await authService
          .verifyAccessToken(
            accessToken
          );

      if (
        !isValidJwtPayload(
          decodedPayload
        )
      ) {
        throw new ApiError(
          401,
          "Invalid or expired access token."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Confirm Current Account and Session
      |--------------------------------------------------------------------------
      |
      | We deliberately query the database on every protected request.
      |
      | This ensures:
      | - deleted accounts are rejected immediately;
      | - password changes/resets revoke old access tokens immediately;
      | - logout revokes old access tokens immediately;
      | - current username/email are attached instead of stale JWT values.
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

      if (
        !user
      ) {
        throw new ApiError(
          401,
          "User account is unavailable."
        );
      }

      if (
        user.sessionVersion !==
        decodedPayload
          .sessionVersion
      ) {
        throw new ApiError(
          401,
          "Your session has been revoked. Please sign in again."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Attach Trusted Current Identity
      |--------------------------------------------------------------------------
      |
      | Values come from the current database record rather than directly from
      | the JWT. Existing controllers can continue using req.user._id,
      | req.user.email, and req.user.username.
      |
      */

      req.user = {
        _id:
          user._id.toString(),

        email:
          user.email,

        username:
          user.username,

        sessionVersion:
          user.sessionVersion,
      };

      next();
    } catch (
      error
    ) {
      next(
        error
      );
    }
  };