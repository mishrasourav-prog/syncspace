import { z } from "zod";

export const registerUserSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }).max(100, { message: "Name must be less than 100 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }).max(128, { message: "Password must be less than 128 characters long" }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character" }),
    username: z.string().min(5, { message: "Username must be at least 5 characters long" }).max(12, { message: "Username must be less than 12 characters long" }),
}).strict();

export const loginUserSchema = z.object({
    email: z.string().trim().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
});

export const forgotPasswordSchema = z.object({
    email: z.string().trim().email({ message: "Invalid email address" }),
});

export const verifyOtpSchema = z.object({
    email: z.string().trim(),
    otp: z.string().length(6)
});


export const resetPasswordSchema = z
  .object({
    email: z.email(),

    resetToken: z.string().min(1),

    newPassword: z
      .string()
      .min(8)
      .max(128),

    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    }
  );

  export const resendOtpSchema = z.object({
    email: z.string().email(),
});