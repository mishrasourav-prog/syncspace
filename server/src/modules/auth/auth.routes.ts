import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  forgotPassword,  
  verifyOtpResetPassword,
  resetPassword,
  resendResetOtp
} from "./auth.controller";

import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * Public Routes
 */
router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/refresh", refreshAccessToken);

router.post("/forgot-password", forgotPassword);

router.post(
  "/verify-reset-otp",
  verifyOtpResetPassword
);

router.post(
  "/reset-password",
  resetPassword
);

router.post(
    "/resend-reset-otp",
    resendResetOtp
);

/**
 * Protected Routes
 */
router.post("/logout", authenticateUser, logoutUser);

router.get("/me", authenticateUser, getCurrentUser);

export default router;