import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_MAX_LENGTH = 128;

export const USERNAME_MIN_LENGTH = 5;

export const USERNAME_MAX_LENGTH = 12;

export const NAME_MIN_LENGTH = 2;

export const NAME_MAX_LENGTH = 100;

export const passwordSchema = z
  .string({
    error: "Password is required.",
  })
  .min(PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
  })
  .max(PASSWORD_MAX_LENGTH, {
    message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters long.`,
  })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@, $, !, %, *, ?, or &).",
  });

export const emailSchema = z
  .string({
    error: "Email is required.",
  })
  .trim()
  .toLowerCase()
  .email({
    message: "Invalid email address.",
  })
  .max(320, {
    message: "Email must be at most 320 characters long.",
  });

export const registerUserSchema = z
  .object({
    name: z
      .string({
        error: "Name is required.",
      })
      .trim()
      .min(NAME_MIN_LENGTH, {
        message: `Name must be at least ${NAME_MIN_LENGTH} characters long.`,
      })
      .max(NAME_MAX_LENGTH, {
        message: `Name must be at most ${NAME_MAX_LENGTH} characters long.`,
      }),

    email: emailSchema,

    password: passwordSchema,

    username: z
      .string({
        error: "Username is required.",
      })
      .trim()
      .min(USERNAME_MIN_LENGTH, {
        message: `Username must be at least ${USERNAME_MIN_LENGTH} characters long.`,
      })
      .max(USERNAME_MAX_LENGTH, {
        message: `Username must be at most ${USERNAME_MAX_LENGTH} characters long.`,
      })
      .regex(/^[A-Za-z0-9]+$/, {
        message: "Username can only contain letters and numbers.",
      }),
  })
  .strict();

export const loginUserSchema = z
  .object({
    email: emailSchema,

    password: z
      .string({
        error: "Password is required.",
      })
      .min(1, {
        message: "Password is required.",
      })
      .max(PASSWORD_MAX_LENGTH, {
        message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters long.`,
      }),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export const verifyOtpSchema = z
  .object({
    email: emailSchema,

    otp: z
      .string({
        error: "OTP is required.",
      })
      .trim()
      .regex(/^\d{6}$/, {
        message: "OTP must contain exactly 6 digits.",
      }),
  })
  .strict();

export const verifyEmailSchema = verifyOtpSchema;

export const resendEmailVerificationSchema = forgotPasswordSchema;

export const resetPasswordSchema = z
  .object({
    email: emailSchema,

    resetToken: z
      .string({
        error: "Reset token is required.",
      })
      .trim()
      .min(1, {
        message: "Reset token is required.",
      })
      .max(4096, {
        message: "Reset token is invalid.",
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
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],

    message: "Passwords do not match.",
  });

export const resendOtpSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export type LoginUserInput = z.infer<typeof loginUserSchema>;

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export type ResendEmailVerificationInput = z.infer<
  typeof resendEmailVerificationSchema
>;

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
