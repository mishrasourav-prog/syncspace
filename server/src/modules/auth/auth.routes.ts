import { Router } from "express";

import {
  registerUser,
  verifyEmail,
  resendEmailVerification,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  forgotPassword,
  verifyOtpResetPassword,
  resetPassword,
  resendResetOtp,
} from "./auth.controller";

import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerUser);

router.post("/verify-email", verifyEmail);

router.post("/resend-verification-otp", resendEmailVerification);

router.post("/login", loginUser);

router.post("/refresh", refreshAccessToken);

router.post("/forgot-password", forgotPassword);

router.post("/verify-reset-otp", verifyOtpResetPassword);

router.post("/reset-password", resetPassword);

router.post("/resend-reset-otp", resendResetOtp);

router.post("/logout", authenticateUser, logoutUser);

router.get("/me", authenticateUser, getCurrentUser);

export default router;
