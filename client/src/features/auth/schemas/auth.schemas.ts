import { z } from "zod";

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email").max(320, "Email is too long"),
  password: z.string().min(1, "Password is required").max(128, "Password is too long"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be under 100 characters"),
    username: z
      .string()
      .trim()
      .min(5, "Username must be at least 5 characters")
      .max(12, "Username must be under 13 characters")
      .regex(/^[A-Za-z0-9]+$/, "Username can contain only letters and numbers"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email").max(320, "Email is too long"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be under 129 characters")
      .regex(
        PASSWORD_PATTERN,
        "Include uppercase, lowercase, number, and one special character (@, $, !, %, *, ?, or &)"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password").max(128, "Password is too long"),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email").max(320, "Email is too long"),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const otpSchema = z.object({
  otp: z.string().length(6, "Enter the full 6-digit code").regex(/^\d+$/, "Code must be numeric"),
});
export type OtpFormValues = z.infer<typeof otpSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be under 129 characters")
      .regex(
        PASSWORD_PATTERN,
        "Include uppercase, lowercase, number, and one special character (@, $, !, %, *, ?, or &)"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password").max(128, "Password is too long"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
