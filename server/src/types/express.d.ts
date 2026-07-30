import type { IJwtPayload } from "../interfaces/user.interface";

declare module "express-serve-static-core" {
  interface Request {
    user?: Pick<IJwtPayload, "_id" | "email" | "username" | "sessionVersion">;
  }
}

export {};
