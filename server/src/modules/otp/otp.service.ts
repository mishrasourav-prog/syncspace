import crypto from "crypto";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import ApiError from "../../utils/ApiError";

import { Otp, OtpPurpose } from "./otp.model";

export class OtpService {
  private readonly OTP_EXPIRY_MS = 10 * 60 * 1000;

  generateOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  async hashOtp(otp: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);

    return bcrypt.hash(otp, salt);
  }

  async deleteExistingOtp(
    emailInput: string,
    purpose: OtpPurpose,
  ): Promise<void> {
    const email = emailInput.trim().toLowerCase();

    await Otp.deleteOne({
      email,
      purpose,
    });
  }

  async createOtp(emailInput: string, purpose: OtpPurpose): Promise<string> {
    const email = emailInput.trim().toLowerCase();

    const plainOtp = this.generateOtp();

    const otpHash = await this.hashOtp(plainOtp);

    await this.deleteExistingOtp(email, purpose);

    await Otp.create({
      email,
      otpHash,
      expiresAt: new Date(Date.now() + this.OTP_EXPIRY_MS),
      attempts: 0,
      purpose,
      isVerified: false,
    });

    return plainOtp;
  }

  async verifyOtp(plainOtp: string, hashedOtp: string): Promise<boolean> {
    return bcrypt.compare(plainOtp, hashedOtp);
  }

  generateResetToken(email: string): string {
    const secret = process.env.RESET_TOKEN_SECRET;

    if (!secret) {
      throw new ApiError(500, "Reset-token configuration is unavailable.");
    }

    return jwt.sign(
      {
        email,
      },
      secret,
      {
        expiresIn: "10m",
      },
    );
  }

  verifyResetToken(token: string): {
    email: string;
  } {
    const secret = process.env.RESET_TOKEN_SECRET;

    if (!secret) {
      throw new ApiError(500, "Reset-token configuration is unavailable.");
    }

    try {
      const decoded = jwt.verify(token, secret);

      if (
        typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.email !== "string"
      ) {
        throw new ApiError(401, "Invalid or expired reset token.");
      }

      return {
        email: decoded.email,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(401, "Invalid or expired reset token.");
    }
  }
}

export default new OtpService();
