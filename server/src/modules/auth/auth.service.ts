import bcrypt from "bcryptjs";

import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

import { DomainEventName, eventBus } from "../../events";

import type {
  IJwtPayload,
  IUser,
  LoginResponse,
  LoginUser,
  PendingRegistrationResponse,
  RegisterUser,
  ResetResponse,
  currentUser,
} from "../../interfaces/user.interface";

import ApiError from "../../utils/ApiError";

import MailService from "../mail/mail.service";

import { Otp, OtpPurpose } from "../otp/otp.model";

import OtpService from "../otp/otp.service";

import { User, type IUserDocument } from "./auth.model";

import {
  PendingRegistration,
  type IPendingRegistrationDocument,
} from "./pending-registration.model";

interface MongoDuplicateKeyError {
  code: number;

  keyPattern?: Record<string, number>;
}

export class AuthService {
  private readonly ACCESS_EXPIRES: SignOptions["expiresIn"] = "15m";

  private readonly REFRESH_EXPIRES: SignOptions["expiresIn"] = "7d";

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);

    return bcrypt.hash(password, salt);
  }

  async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private getAccessTokenSecret(): string {
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
      throw new ApiError(500, "Access-token configuration is unavailable.");
    }

    return secret;
  }

  private getRefreshTokenSecret(): string {
    const secret = process.env.REFRESH_TOKEN_SECRET;

    if (!secret) {
      throw new ApiError(500, "Refresh-token configuration is unavailable.");
    }

    return secret;
  }

  private isJwtPayload(decoded: string | JwtPayload): decoded is IJwtPayload {
    if (typeof decoded !== "object" || decoded === null) {
      return false;
    }

    return (
      typeof decoded._id === "string" &&
      decoded._id.length > 0 &&
      typeof decoded.email === "string" &&
      typeof decoded.username === "string" &&
      Number.isInteger(decoded.sessionVersion) &&
      Number(decoded.sessionVersion) >= 0
    );
  }

  private resolveSessionVersion(value: unknown): number {
    return Number.isInteger(value) && Number(value) >= 0 ? Number(value) : 0;
  }

  private buildJwtPayload(
    user: Pick<IUserDocument, "_id" | "email" | "username" | "sessionVersion">,
  ): IJwtPayload {
    return {
      _id: user._id.toString(),

      email: user.email,

      username: user.username,

      sessionVersion: this.resolveSessionVersion(user.sessionVersion),
    };
  }

  generateAccessToken(payload: IJwtPayload): string {
    return jwt.sign(payload, this.getAccessTokenSecret(), {
      expiresIn: this.ACCESS_EXPIRES,
    });
  }

  generateRefreshToken(payload: IJwtPayload): string {
    return jwt.sign(payload, this.getRefreshTokenSecret(), {
      expiresIn: this.REFRESH_EXPIRES,
    });
  }

  verifyAccessToken(token: string): IJwtPayload {
    try {
      const decoded = jwt.verify(token, this.getAccessTokenSecret());

      if (!this.isJwtPayload(decoded)) {
        throw new ApiError(401, "Invalid or expired access token.");
      }

      return decoded;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(401, "Invalid or expired access token.");
    }
  }

  verifyRefreshToken(token: string): IJwtPayload {
    try {
      const decoded = jwt.verify(token, this.getRefreshTokenSecret());

      if (!this.isJwtPayload(decoded)) {
        throw new ApiError(401, "Invalid or expired refresh token.");
      }

      return decoded;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(401, "Invalid or expired refresh token.");
    }
  }

  private readonly EMAIL_OTP_EXPIRY_SECONDS = 10 * 60;

  private readonly PENDING_REGISTRATION_EXPIRY_MS = 30 * 60 * 1000;

  private readonly VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;

  private readonly VERIFICATION_WINDOW_MS = 60 * 60 * 1000;

  private readonly MAX_VERIFICATION_EMAILS_PER_WINDOW = 5;

  async registerUser(data: RegisterUser): Promise<PendingRegistrationResponse> {
    const name = data.name.trim();

    const username = data.username.trim();

    const email = data.email.trim().toLowerCase();

    const now = new Date();

    await PendingRegistration.deleteMany({
      expiresAt: {
        $lte: now,
      },
      $or: [{ email }, { username }],
    });

    const [existingEmail, existingUsername, pendingUsername, existingPending] =
      await Promise.all([
        User.exists({
          email,
          deletedAt: null,
        }),

        User.exists({
          username,
          deletedAt: null,
        }),

        PendingRegistration.exists({
          username,
          email: {
            $ne: email,
          },
          expiresAt: {
            $gt: now,
          },
        }),

        PendingRegistration.findOne({
          email,
          expiresAt: {
            $gt: now,
          },
        }).select("+passwordHash"),
      ]);

    if (existingEmail) {
      throw new ApiError(409, "Email is already registered.");
    }

    if (existingUsername) {
      throw new ApiError(409, "Username is already taken.");
    }

    if (pendingUsername) {
      throw new ApiError(
        409,
        "Username is currently reserved by another pending registration.",
      );
    }

    const passwordHash = await this.hashPassword(data.password);

    const claim = await this.claimVerificationEmail({
      pending: existingPending,
      registration: {
        name,
        username,
        email,
        passwordHash,
      },
      now,
    });

    try {
      const otp = await OtpService.createOtp(
        email,
        OtpPurpose.EMAIL_VERIFICATION,
      );

      await MailService.sendEmailVerificationOtp(email, otp);
    } catch (error) {
      await OtpService.deleteExistingOtp(email, OtpPurpose.EMAIL_VERIFICATION);

      await this.rollbackVerificationClaim(claim);

      throw new ApiError(
        503,
        "Verification email could not be sent. Please try again shortly.",
      );
    }

    return {
      email,
      expiresInSeconds: this.EMAIL_OTP_EXPIRY_SECONDS,
      resendAvailableInSeconds: Math.floor(
        this.VERIFICATION_RESEND_COOLDOWN_MS / 1000,
      ),
    };
  }

  async verifyEmailRegistration(
    emailInput: string,
    otp: string,
  ): Promise<IUser> {
    const email = emailInput.trim().toLowerCase();

    const pending = await PendingRegistration.findOne({
      email,
    }).select("+passwordHash");

    if (!pending) {
      throw new ApiError(
        410,
        "Registration session expired. Please sign up again.",
      );
    }

    if (pending.expiresAt <= new Date()) {
      await Promise.all([
        pending.deleteOne(),
        OtpService.deleteExistingOtp(email, OtpPurpose.EMAIL_VERIFICATION),
      ]);

      throw new ApiError(
        410,
        "Registration session expired. Please sign up again.",
      );
    }

    const otpRecord = await Otp.findOne({
      email,
      purpose: OtpPurpose.EMAIL_VERIFICATION,
    });

    if (!otpRecord) {
      throw new ApiError(
        404,
        "Verification code was not found or has expired.",
      );
    }

    if (otpRecord.isVerified) {
      throw new ApiError(
        409,
        "This verification code is already being processed.",
      );
    }

    if (otpRecord.attempts >= 5) {
      await otpRecord.deleteOne();

      throw new ApiError(
        429,
        "Too many attempts. Please request a new verification code.",
      );
    }

    if (otpRecord.expiresAt <= new Date()) {
      await otpRecord.deleteOne();

      throw new ApiError(401, "Verification code has expired.");
    }

    const isValidOtp = await OtpService.verifyOtp(otp, otpRecord.otpHash);

    if (!isValidOtp) {
      otpRecord.attempts += 1;

      if (otpRecord.attempts >= 5) {
        await otpRecord.deleteOne();

        throw new ApiError(
          429,
          "Too many attempts. Please request a new verification code.",
        );
      }

      await otpRecord.save();

      const remainingAttempts = 5 - otpRecord.attempts;

      throw new ApiError(
        401,
        `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining.`,
      );
    }

    const claimedOtp = await Otp.findOneAndUpdate(
      {
        _id: otpRecord._id,
        isVerified: false,
        expiresAt: {
          $gt: new Date(),
        },
      },
      {
        $set: {
          isVerified: true,
        },
      },
      {
        new: true,
      },
    );

    if (!claimedOtp) {
      throw new ApiError(
        409,
        "This verification request is already being processed.",
      );
    }

    const [existingEmail, existingUsername] = await Promise.all([
      User.exists({
        email: pending.email,
        deletedAt: null,
      }),
      User.exists({
        username: pending.username,
        deletedAt: null,
      }),
    ]);

    if (existingEmail || existingUsername) {
      await Promise.all([
        PendingRegistration.deleteOne({
          _id: pending._id,
        }),
        Otp.deleteOne({
          _id: claimedOtp._id,
        }),
      ]);

      throw new ApiError(
        409,
        existingEmail
          ? "This email has already been verified. Please sign in."
          : "Username is no longer available. Please sign up again with another username.",
      );
    }

    let user: IUserDocument;

    try {
      user = await User.create({
        name: pending.name,
        username: pending.username,
        email: pending.email,
        password: pending.passwordHash,
        provider: "email",
        sessionVersion: 0,
      });
    } catch (error) {
      if (this.isMongoDuplicateKeyError(error)) {
        await Promise.all([
          PendingRegistration.deleteOne({
            _id: pending._id,
          }),
          Otp.deleteOne({
            _id: claimedOtp._id,
          }),
        ]);

        throw new ApiError(
          409,
          "Account details are no longer available. Please sign in or register again.",
        );
      }

      await Otp.updateOne(
        {
          _id: claimedOtp._id,
        },
        {
          $set: {
            isVerified: false,
          },
        },
      );

      throw error;
    }

    await Promise.allSettled([
      PendingRegistration.deleteOne({
        _id: pending._id,
      }),
      Otp.deleteOne({
        _id: claimedOtp._id,
      }),
    ]);

    return {
      _id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar ?? undefined,
    };
  }

  async resendEmailVerificationOtp(
    emailInput: string,
  ): Promise<PendingRegistrationResponse> {
    const email = emailInput.trim().toLowerCase();

    const now = new Date();

    const pending = await PendingRegistration.findOne({
      email,
    }).select("+passwordHash");

    if (!pending || pending.expiresAt <= now) {
      await Promise.all([
        PendingRegistration.deleteOne({
          email,
        }),
        OtpService.deleteExistingOtp(email, OtpPurpose.EMAIL_VERIFICATION),
      ]);

      throw new ApiError(
        410,
        "Registration session expired. Please sign up again.",
      );
    }

    const claim = await this.claimVerificationEmail({
      pending,
      now,
    });

    try {
      const otp = await OtpService.createOtp(
        email,
        OtpPurpose.EMAIL_VERIFICATION,
      );

      await MailService.sendEmailVerificationOtp(email, otp);
    } catch (error) {
      await OtpService.deleteExistingOtp(email, OtpPurpose.EMAIL_VERIFICATION);

      await this.rollbackVerificationClaim(claim);

      throw new ApiError(
        503,
        "Verification email could not be sent. Please try again shortly.",
      );
    }

    return {
      email,
      expiresInSeconds: this.EMAIL_OTP_EXPIRY_SECONDS,
      resendAvailableInSeconds: Math.floor(
        this.VERIFICATION_RESEND_COOLDOWN_MS / 1000,
      ),
    };
  }

  private async claimVerificationEmail(options: {
    pending: IPendingRegistrationDocument | null;
    registration?: {
      name: string;
      username: string;
      email: string;
      passwordHash: string;
    };
    now: Date;
  }): Promise<{
    pendingId: string;
    claimedAt: Date;
    wasCreated: boolean;
    previous?: {
      name: string;
      username: string;
      email: string;
      passwordHash: string;
      expiresAt: Date;
      verificationSentAt: Date;
      resendWindowStartedAt: Date;
      resendCount: number;
    };
  }> {
    const { pending, registration, now } = options;

    if (!pending) {
      if (!registration) {
        throw new ApiError(
          410,
          "Registration session expired. Please sign up again.",
        );
      }

      try {
        const created = await PendingRegistration.create({
          ...registration,
          expiresAt: new Date(
            now.getTime() + this.PENDING_REGISTRATION_EXPIRY_MS,
          ),
          verificationSentAt: now,
          resendWindowStartedAt: now,
          resendCount: 1,
        });

        return {
          pendingId: created._id.toString(),
          claimedAt: now,
          wasCreated: true,
        };
      } catch (error) {
        if (this.isMongoDuplicateKeyError(error)) {
          throw new ApiError(
            409,
            "A verification request with this email or username is already active.",
          );
        }

        throw error;
      }
    }

    const millisecondsSinceLastSend =
      now.getTime() - pending.verificationSentAt.getTime();

    if (millisecondsSinceLastSend < this.VERIFICATION_RESEND_COOLDOWN_MS) {
      const secondsRemaining = Math.ceil(
        (this.VERIFICATION_RESEND_COOLDOWN_MS - millisecondsSinceLastSend) /
          1000,
      );

      throw new ApiError(
        429,
        `Please wait ${secondsRemaining} second${secondsRemaining === 1 ? "" : "s"} before requesting another code.`,
      );
    }

    const windowExpired =
      now.getTime() - pending.resendWindowStartedAt.getTime() >=
      this.VERIFICATION_WINDOW_MS;

    if (
      !windowExpired &&
      pending.resendCount >= this.MAX_VERIFICATION_EMAILS_PER_WINDOW
    ) {
      throw new ApiError(
        429,
        "Too many verification emails were requested. Please try again later.",
      );
    }

    const previous = {
      name: pending.name,
      username: pending.username,
      email: pending.email,
      passwordHash: pending.passwordHash,
      expiresAt: pending.expiresAt,
      verificationSentAt: pending.verificationSentAt,
      resendWindowStartedAt: pending.resendWindowStartedAt,
      resendCount: pending.resendCount,
    };

    const nextWindowStartedAt = windowExpired
      ? now
      : pending.resendWindowStartedAt;

    const nextResendCount = windowExpired ? 1 : pending.resendCount + 1;

    const update: Record<string, unknown> = {
      verificationSentAt: now,
      resendWindowStartedAt: nextWindowStartedAt,
      resendCount: nextResendCount,
      expiresAt: new Date(now.getTime() + this.PENDING_REGISTRATION_EXPIRY_MS),
    };

    if (registration) {
      update.name = registration.name;
      update.username = registration.username;
      update.email = registration.email;
      update.passwordHash = registration.passwordHash;
    }

    let claimed: IPendingRegistrationDocument | null;

    try {
      claimed = await PendingRegistration.findOneAndUpdate(
        {
          _id: pending._id,
          verificationSentAt: pending.verificationSentAt,
          resendCount: pending.resendCount,
          resendWindowStartedAt: pending.resendWindowStartedAt,
        },
        {
          $set: update,
        },
        {
          new: true,
        },
      ).select("+passwordHash");
    } catch (error) {
      if (this.isMongoDuplicateKeyError(error)) {
        throw new ApiError(
          409,
          "Username is currently reserved by another pending registration.",
        );
      }

      throw error;
    }

    if (!claimed) {
      throw new ApiError(
        429,
        "Another verification request is already in progress. Please wait before trying again.",
      );
    }

    return {
      pendingId: claimed._id.toString(),
      claimedAt: now,
      wasCreated: false,
      previous,
    };
  }

  private async rollbackVerificationClaim(claim: {
    pendingId: string;
    claimedAt: Date;
    wasCreated: boolean;
    previous?: {
      name: string;
      username: string;
      email: string;
      passwordHash: string;
      expiresAt: Date;
      verificationSentAt: Date;
      resendWindowStartedAt: Date;
      resendCount: number;
    };
  }): Promise<void> {
    if (claim.wasCreated) {
      await PendingRegistration.deleteOne({
        _id: claim.pendingId,
        verificationSentAt: claim.claimedAt,
      });

      return;
    }

    if (!claim.previous) {
      return;
    }

    await PendingRegistration.updateOne(
      {
        _id: claim.pendingId,
        verificationSentAt: claim.claimedAt,
      },
      {
        $set: claim.previous,
      },
    );
  }

  async loginUser(data: LoginUser): Promise<LoginResponse> {
    const email = data.email.trim().toLowerCase();

    const user = await User.findOne({
      email,
      deletedAt: null,
    }).select(["+password", "+refreshToken", "+sessionVersion"].join(" "));

    if (!user || !user.password) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const isValidPassword = await this.comparePassword(
      data.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new ApiError(401, "Invalid email or password.");
    }

    if (!Number.isInteger(user.sessionVersion) || user.sessionVersion < 0) {
      user.sessionVersion = 0;
    }

    const payload = this.buildJwtPayload(user);

    const accessToken = this.generateAccessToken(payload);

    const refreshToken = this.generateRefreshToken(payload);

    user.refreshToken = refreshToken;

    user.lastLoginAt = new Date();

    await user.save({
      validateBeforeSave: false,
    });

    return {
      user: {
        _id: user._id.toString(),

        name: user.name,

        username: user.username,

        email: user.email,

        avatar: user.avatar ?? undefined,
      },

      accessToken,
      refreshToken,
    };
  }

  async logoutUser(userId: string): Promise<void> {
    const user = await User.findOneAndUpdate(
      {
        _id: userId,

        deletedAt: null,
      },
      {
        $set: {
          refreshToken: null,
        },

        $inc: {
          sessionVersion: 1,
        },
      },
      {
        new: true,

        select: "_id +sessionVersion",
      },
    );

    if (!user) {
      throw new ApiError(401, "User account is unavailable.");
    }

    await eventBus.publish(DomainEventName.USER_SESSION_REVOKED, {
      userId: user._id.toString(),

      reason: "logout",
    });
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const payload = this.verifyRefreshToken(refreshToken);

    const user = await User.findOne({
      _id: payload._id,

      deletedAt: null,
    }).select(
      ["_id", "email", "username", "+refreshToken", "+sessionVersion"].join(
        " ",
      ),
    );

    if (!user) {
      throw new ApiError(401, "User account is unavailable.");
    }

    if (user.sessionVersion !== payload.sessionVersion) {
      throw new ApiError(
        401,
        "Your session has been revoked. Please sign in again.",
      );
    }

    if (!user.refreshToken || user.refreshToken !== refreshToken) {
      throw new ApiError(401, "Invalid refresh token.");
    }

    return this.generateAccessToken(this.buildJwtPayload(user));
  }

  async getCurrentUser(userId: string): Promise<currentUser> {
    const user = await User.findOne({
      _id: userId,

      deletedAt: null,
    }).select(["_id", "name", "username", "email", "avatar"].join(" "));

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    return {
      user: {
        _id: user._id.toString(),

        name: user.name,

        username: user.username,

        email: user.email,

        avatar: user.avatar ?? undefined,
      },
    };
  }

  async forgotPassword(emailInput: string): Promise<void> {
    const email = emailInput.trim().toLowerCase();

    const userExists = await User.exists({
      email,
      provider: "email",

      deletedAt: null,
    });

    if (!userExists) {
      return;
    }

    const otp = await OtpService.createOtp(email, OtpPurpose.PASSWORD_RESET);

    await MailService.sendPasswordResetOtp(email, otp);
  }

  async verifyOtpResetPassword(
    emailInput: string,
    otp: string,
  ): Promise<ResetResponse> {
    const email = emailInput.trim().toLowerCase();

    const otpRecord = await Otp.findOne({
      email,

      purpose: OtpPurpose.PASSWORD_RESET,
    });

    if (!otpRecord) {
      throw new ApiError(404, "OTP not found or expired.");
    }

    if (otpRecord.attempts >= 5) {
      await otpRecord.deleteOne();

      throw new ApiError(429, "Too many attempts. Please request a new OTP.");
    }

    if (otpRecord.expiresAt <= new Date()) {
      await otpRecord.deleteOne();

      throw new ApiError(401, "OTP has expired.");
    }

    const isValidOtp = await OtpService.verifyOtp(otp, otpRecord.otpHash);

    if (!isValidOtp) {
      otpRecord.attempts += 1;

      if (otpRecord.attempts >= 5) {
        await otpRecord.deleteOne();

        throw new ApiError(429, "Too many attempts. Please request a new OTP.");
      }

      await otpRecord.save();

      throw new ApiError(401, "Invalid OTP.");
    }

    otpRecord.attempts = 0;

    otpRecord.isVerified = true;

    await otpRecord.save();

    const resetToken = OtpService.generateResetToken(email);

    return {
      email,
      resetToken,
    };
  }

  async resetPassword(
    emailInput: string,
    resetToken: string,
    newPassword: string,
  ): Promise<void> {
    const email = emailInput.trim().toLowerCase();

    const resetPayload = OtpService.verifyResetToken(resetToken);

    if (resetPayload.email.trim().toLowerCase() !== email) {
      throw new ApiError(401, "Invalid or expired reset token.");
    }

    const user = await User.findOne({
      email,
      provider: "email",

      deletedAt: null,
    }).select(["+password", "+refreshToken", "+sessionVersion"].join(" "));

    if (!user || !user.password) {
      throw new ApiError(
        401,
        "Reset session is unavailable. Please request a new OTP.",
      );
    }

    const samePassword = await this.comparePassword(newPassword, user.password);

    if (samePassword) {
      throw new ApiError(
        400,
        "New password cannot be the same as the old password.",
      );
    }

    const hashedPassword = await this.hashPassword(newPassword);

    const consumedOtp = await Otp.findOneAndDelete({
      email,

      purpose: OtpPurpose.PASSWORD_RESET,

      isVerified: true,

      expiresAt: {
        $gt: new Date(),
      },
    });

    if (!consumedOtp) {
      throw new ApiError(
        401,
        "Reset session expired. Please request a new OTP.",
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,

        password: user.password,

        deletedAt: null,
      },
      {
        $set: {
          password: hashedPassword,

          passwordChangedAt: new Date(),

          refreshToken: null,
        },

        $inc: {
          sessionVersion: 1,
        },
      },
      {
        new: true,

        select: "_id +sessionVersion",
      },
    );

    if (!updatedUser) {
      throw new ApiError(
        409,
        "The account changed while resetting the password. Please request a new OTP.",
      );
    }

    await Otp.deleteMany({
      email,

      purpose: OtpPurpose.PASSWORD_RESET,
    });

    await eventBus.publish(DomainEventName.USER_SESSION_REVOKED, {
      userId: updatedUser._id.toString(),

      reason: "password_reset",
    });
  }

  async resendResetOtp(emailInput: string): Promise<void> {
    const email = emailInput.trim().toLowerCase();

    const userExists = await User.exists({
      email,
      provider: "email",

      deletedAt: null,
    });

    if (!userExists) {
      return;
    }

    const otp = await OtpService.createOtp(email, OtpPurpose.PASSWORD_RESET);

    await MailService.sendPasswordResetOtp(email, otp);
  }

  private isMongoDuplicateKeyError(
    error: unknown,
  ): error is MongoDuplicateKeyError {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (
        error as {
          code?: unknown;
        }
      ).code === 11000
    );
  }
}

export default new AuthService();
