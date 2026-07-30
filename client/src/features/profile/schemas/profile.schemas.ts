import { z } from "zod";

import type {
  DeleteAccountPayload,
  UpdateSelfProfilePayload,
} from "../types/profile.types";

export const PROFILE_NAME_MIN_LENGTH = 2;

export const PROFILE_NAME_MAX_LENGTH = 100;

export const PROFILE_USERNAME_MIN_LENGTH = 5;

export const PROFILE_USERNAME_MAX_LENGTH = 12;

export const PROFILE_HEADLINE_MAX_LENGTH = 80;

export const PROFILE_BIO_MAX_LENGTH = 500;

export const PROFILE_LOCATION_MAX_LENGTH = 120;

export const PROFILE_PASSWORD_MIN_LENGTH = 8;

export const PROFILE_PASSWORD_MAX_LENGTH = 128;

export const PROFILE_AVATAR_MAX_SIZE = 5 * 1024 * 1024;

export const PROFILE_AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";

const PROFILE_USERNAME_PATTERN = /^[A-Za-z0-9]+$/;

const PROFILE_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const profileFormSchema = z
  .object({
    name: z
      .string({
        error: "Name is required.",
      })
      .trim()
      .min(PROFILE_NAME_MIN_LENGTH, {
        message: `Name must be at least ${PROFILE_NAME_MIN_LENGTH} characters long.`,
      })
      .max(PROFILE_NAME_MAX_LENGTH, {
        message: `Name must be at most ${PROFILE_NAME_MAX_LENGTH} characters long.`,
      }),

    username: z
      .string({
        error: "Username is required.",
      })
      .trim()
      .min(PROFILE_USERNAME_MIN_LENGTH, {
        message: `Username must be at least ${PROFILE_USERNAME_MIN_LENGTH} characters long.`,
      })
      .max(PROFILE_USERNAME_MAX_LENGTH, {
        message: `Username must be at most ${PROFILE_USERNAME_MAX_LENGTH} characters long.`,
      })
      .regex(PROFILE_USERNAME_PATTERN, {
        message: "Username can only contain letters and numbers.",
      }),

    headline: z
      .string()
      .trim()
      .max(PROFILE_HEADLINE_MAX_LENGTH, {
        message: `Headline must be at most ${PROFILE_HEADLINE_MAX_LENGTH} characters long.`,
      }),

    bio: z
      .string()
      .trim()
      .max(PROFILE_BIO_MAX_LENGTH, {
        message: `Bio must be at most ${PROFILE_BIO_MAX_LENGTH} characters long.`,
      }),

    location: z
      .string()
      .trim()
      .max(PROFILE_LOCATION_MAX_LENGTH, {
        message: `Location must be at most ${PROFILE_LOCATION_MAX_LENGTH} characters long.`,
      }),
  })
  .strict();

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

const nullableProfileValue = (value: string): string | null => {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
};

export const toUpdateSelfProfilePayload = (
  values: ProfileFormValues,
): UpdateSelfProfilePayload => ({
  name: values.name.trim(),

  username: values.username.trim(),

  headline: nullableProfileValue(values.headline),

  bio: nullableProfileValue(values.bio),

  location: nullableProfileValue(values.location),
});

export const avatarFormSchema = z
  .object({
    file: z
      .custom<File>(
        (value) => typeof File !== "undefined" && value instanceof File,
        {
          message: "Choose an avatar image.",
        },
      )
      .refine((file) => ALLOWED_AVATAR_TYPES.has(file.type), {
        message: "Avatar must be a JPEG, PNG, or WebP image.",
      })
      .refine((file) => file.size > 0, {
        message: "Avatar image cannot be empty.",
      })
      .refine((file) => file.size <= PROFILE_AVATAR_MAX_SIZE, {
        message: "Avatar image must be 5 MB or smaller.",
      }),
  })
  .strict();

export type AvatarFormValues = z.infer<typeof avatarFormSchema>;

export const profilePasswordSchema = z
  .string({
    error: "Password is required.",
  })
  .min(PROFILE_PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${PROFILE_PASSWORD_MIN_LENGTH} characters long.`,
  })
  .max(PROFILE_PASSWORD_MAX_LENGTH, {
    message: `Password must be at most ${PROFILE_PASSWORD_MAX_LENGTH} characters long.`,
  })
  .regex(PROFILE_PASSWORD_PATTERN, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@, $, !, %, *, ?, or &).",
  });

export const changePasswordFormSchema = z
  .object({
    currentPassword: z
      .string({
        error: "Current password is required.",
      })
      .min(1, {
        message: "Current password is required.",
      })
      .max(PROFILE_PASSWORD_MAX_LENGTH, {
        message: `Current password must be at most ${PROFILE_PASSWORD_MAX_LENGTH} characters long.`,
      }),

    newPassword: profilePasswordSchema,

    confirmPassword: z
      .string({
        error: "Password confirmation is required.",
      })
      .min(1, {
        message: "Password confirmation is required.",
      })
      .max(PROFILE_PASSWORD_MAX_LENGTH, {
        message: `Password confirmation must be at most ${PROFILE_PASSWORD_MAX_LENGTH} characters long.`,
      }),
  })
  .strict()
  .superRefine((values, context) => {
    if (values.newPassword !== values.confirmPassword) {
      context.addIssue({
        code: "custom",

        path: ["confirmPassword"],

        message: "Passwords do not match.",
      });
    }

    if (values.currentPassword === values.newPassword) {
      context.addIssue({
        code: "custom",

        path: ["newPassword"],

        message: "New password cannot be the same as the current password.",
      });
    }
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

const deleteAccountBaseSchema = z
  .object({
    confirmation: z
      .string({
        error: 'Type "DELETE" to confirm account deletion.',
      })
      .trim(),

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

    currentPassword: z.string().max(PROFILE_PASSWORD_MAX_LENGTH, {
      message: `Current password must be at most ${PROFILE_PASSWORD_MAX_LENGTH} characters long.`,
    }),
  })
  .strict();

export type DeleteAccountFormValues = z.infer<typeof deleteAccountBaseSchema>;

export const createDeleteAccountFormSchema = (
  expectedUsername: string,

  requireCurrentPassword: boolean,
) =>
  deleteAccountBaseSchema.superRefine((values, context) => {
    if (values.confirmation !== "DELETE") {
      context.addIssue({
        code: "custom",

        path: ["confirmation"],

        message: 'Type "DELETE" exactly to confirm account deletion.',
      });
    }

    if (values.username !== expectedUsername) {
      context.addIssue({
        code: "custom",

        path: ["username"],

        message: "Username confirmation does not match.",
      });
    }

    if (requireCurrentPassword && values.currentPassword.trim().length === 0) {
      context.addIssue({
        code: "custom",

        path: ["currentPassword"],

        message: "Current password is required to delete this account.",
      });
    }
  });

export const toDeleteAccountPayload = (
  values: DeleteAccountFormValues,

  requireCurrentPassword: boolean,
): DeleteAccountPayload => ({
  confirmation: "DELETE",

  username: values.username.trim(),

  ...(requireCurrentPassword
    ? {
        currentPassword: values.currentPassword,
      }
    : {}),
});
