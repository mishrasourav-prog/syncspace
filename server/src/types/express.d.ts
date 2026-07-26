import type {
  IJwtPayload,
} from "../interfaces/user.interface";

/*
|--------------------------------------------------------------------------
| Express Request Augmentation
|--------------------------------------------------------------------------
|
| `authenticateUser` attaches the current database-backed identity after:
|
| - verifying the access-token signature;
| - confirming that the account is active;
| - comparing JWT and database session versions.
|
| Only the trusted identity fields are exposed to controllers. JWT timing
| claims such as `iat` and `exp` are intentionally not attached to Request.
|
*/

declare module "express-serve-static-core" {
  interface Request {
    user?: Pick<
      IJwtPayload,
      | "_id"
      | "email"
      | "username"
      | "sessionVersion"
    >;
  }
}

export {};