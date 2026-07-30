import { Types } from "mongoose";
import { z } from "zod";

import ApiError from "./ApiError";

const paginationCursorPayloadSchema = z
  .object({
    version: z.literal(1),

    createdAt: z.string().datetime({
      offset: true,
    }),

    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId."),
  })
  .strict();

export interface IPaginationCursorPosition {
  createdAt: Date;
  id: Types.ObjectId;
}

export const encodePaginationCursor = (
  position: IPaginationCursorPosition,
): string => {
  const payload = {
    version: 1 as const,
    createdAt: position.createdAt.toISOString(),
    id: position.id.toString(),
  };

  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
};

export const decodePaginationCursor = (
  cursor: string,
): IPaginationCursorPosition => {
  try {
    const decodedValue = Buffer.from(cursor, "base64url").toString("utf8");

    const parsedValue: unknown = JSON.parse(decodedValue);

    const payload = paginationCursorPayloadSchema.parse(parsedValue);

    const createdAt = new Date(payload.createdAt);

    if (Number.isNaN(createdAt.getTime())) {
      throw new Error("Invalid cursor date.");
    }

    if (!Types.ObjectId.isValid(payload.id)) {
      throw new Error("Invalid cursor identifier.");
    }

    return {
      createdAt,
      id: new Types.ObjectId(payload.id),
    };
  } catch {
    throw new ApiError(400, "Invalid pagination cursor.");
  }
};
