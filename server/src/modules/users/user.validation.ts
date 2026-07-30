import { z } from "zod";

import { objectIdSchema } from "../../validators/common.validation";

import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  passwordSchema,
} from "../auth/auth.validation";

export const HEADLINE_MAX_LENGTH = 80;

export const BIO_MAX_LENGTH = 500;

export const LOCATION_MAX_LENGTH = 120;

export const AVATAR_URL_MAX_LENGTH = 2048;

const USERNAME_PATTERN = /^[A-Za-z0-9]+$/;

const nullableTrimmedText = (maximumLength: number, fieldName: string) =>
  z.preprocess(
    (value) => {
      if (value === null) {
        return null;
      }

      if (typeof value === "string") {
        const trimmed = value.trim();

        return trimmed.length === 0 ? null : trimmed;
      }

      return value;
    },
    z.union([
      z.string().max(maximumLength, {
        message: `${fieldName} must be at most ${maximumLength} characters long.`,
      }),

      z.null(),
    ]),
  );

export const avatarUrlSchema = z.preprocess(
  (value) => {
    if (value === null) {
      return null;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();

      return trimmed.length === 0 ? null : trimmed;
    }

    return value;
  },
  z.union([
    z
      .string()
      .max(AVATAR_URL_MAX_LENGTH, {
        message: `Avatar URL must be at most ${AVATAR_URL_MAX_LENGTH} characters long.`,
      })
      .url({
        message: "Avatar must be a valid URL.",
      })
      .refine(
        (value) => {
          try {
            const protocol = new URL(value).protocol;

            return protocol === "http:" || protocol === "https:";
          } catch {
            return false;
          }
        },
        {
          message: "Avatar must use an HTTP or HTTPS URL.",
        },
      ),

    z.null(),
  ]),
);

export const updateSelfProfileSchema = z
  .object({
    name: z
      .string({
        error: "Name must be a string.",
      })
      .trim()
      .min(NAME_MIN_LENGTH, {
        message: `Name must be at least ${NAME_MIN_LENGTH} characters long.`,
      })
      .max(NAME_MAX_LENGTH, {
        message: `Name must be at most ${NAME_MAX_LENGTH} characters long.`,
      })
      .optional(),

    username: z
      .string({
        error: "Username must be a string.",
      })
      .trim()
      .min(USERNAME_MIN_LENGTH, {
        message: `Username must be at least ${USERNAME_MIN_LENGTH} characters long.`,
      })
      .max(USERNAME_MAX_LENGTH, {
        message: `Username must be at most ${USERNAME_MAX_LENGTH} characters long.`,
      })
      .regex(USERNAME_PATTERN, {
        message: "Username can only contain letters and numbers.",
      })
      .optional(),

    avatar: avatarUrlSchema.optional(),

    headline: nullableTrimmedText(HEADLINE_MAX_LENGTH, "Headline").optional(),

    bio: nullableTrimmedText(BIO_MAX_LENGTH, "Bio").optional(),

    location: nullableTrimmedText(LOCATION_MAX_LENGTH, "Location").optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one profile field must be provided.",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({
        error: "Current password is required.",
      })
      .min(1, {
        message: "Current password is required.",
      })
      .max(PASSWORD_MAX_LENGTH, {
        message: `Current password must be at most ${PASSWORD_MAX_LENGTH} characters long.`,
      }),

    newPassword: passwordSchema,

    confirmPassword: z
      .string({
        error: "Password confirmation is required.",
      })
      .min(1, {
        message: "Password confirmation is required.",
      })
      .max(PASSWORD_MAX_LENGTH, {
        message: `Password confirmation must be at most ${PASSWORD_MAX_LENGTH} characters long.`,
      }),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.newPassword !== data.confirmPassword) {
      context.addIssue({
        code: "custom",

        path: ["confirmPassword"],

        message: "Passwords do not match.",
      });
    }

    if (data.currentPassword === data.newPassword) {
      context.addIssue({
        code: "custom",

        path: ["newPassword"],

        message: "New password cannot be the same as the current password.",
      });
    }
  });

export const deleteAccountSchema = z
  .object({
    confirmation: z.literal("DELETE", {
      error: 'Type "DELETE" to confirm account deletion.',
    }),

    username: z
      .string({
        error: "Username confirmation is required.",
      })
      .trim()
      .min(1, {
        message: "Username confirmation is required.",
      })
      .max(64, {
        message: "Username confirmation is invalid.",
      }),

    currentPassword: z
      .string()
      .min(1, {
        message: "Current password cannot be empty.",
      })
      .max(PASSWORD_MAX_LENGTH, {
        message: `Current password must be at most ${PASSWORD_MAX_LENGTH} characters long.`,
      })
      .optional(),
  })
  .strict();

export const memberProfileParamsSchema = z
  .object({
    userId: objectIdSchema,
  })
  .strict();

export const memberProfileQuerySchema = z
  .object({
    workspaceId: objectIdSchema.optional(),

    projectId: objectIdSchema.optional(),
  })
  .strict()
  .refine((data) => Boolean(data.workspaceId || data.projectId), {
    message: "workspaceId or projectId is required.",
  });

export type UpdateSelfProfileInput = z.infer<typeof updateSelfProfileSchema>;

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

export type MemberProfileParamsInput = z.infer<
  typeof memberProfileParamsSchema
>;

export type MemberProfileQueryInput = z.infer<typeof memberProfileQuerySchema>;
