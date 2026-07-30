import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;

export const objectIdSchema = z
  .string()
  .trim()
  .regex(objectIdRegex, "Invalid identifier.");

export const cursorSchema = z
  .string()
  .trim()
  .min(1, "Cursor cannot be empty.")
  .max(512, "Cursor is invalid.")
  .regex(/^[A-Za-z0-9_-]+$/, "Cursor is invalid.");
