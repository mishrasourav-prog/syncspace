// import bcrypt from "bcryptjs";
// import jwt, { JwtPayload } from "jsonwebtoken";
// import { IJwtPayload, IUser } from "../../interfaces/user.interface";
// import ApiError from "../../utils/ApiError";
// import { LoginUser , RegisterUser , LoginResponse , currentUser , ResetResponse} from "../../interfaces/user.interface";
// import { User } from "./auth.model";
// import { IUserDocument } from "./auth.model";
// import OtpService from "../otp/otp.service";
// import  MailService  from "../mail/mail.service";
// import { Otp } from "../otp/otp.model";
// import { OtpPurpose } from "../otp/otp.model";



// export class AuthService {


//   private readonly ACCESS_EXPIRES = "15m";
//   private readonly REFRESH_EXPIRES = "7d";


//   async hashPassword(password: string): Promise<string> {
//     const salt = await bcrypt.genSalt(12);
//     return bcrypt.hash(password, salt);
//   }

//   async comparePassword(
//     plainPassword: string,
//     hashedPassword: string
//   ): Promise<boolean> {
//     return bcrypt.compare(plainPassword, hashedPassword);
//   }
//   generateAccessToken(payload: IJwtPayload): string {
//     return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
//       expiresIn: this.ACCESS_EXPIRES,
//     });
//   }


//   generateRefreshToken(payload: IJwtPayload): string {
//     return jwt.sign(
//       payload,
//       process.env.REFRESH_TOKEN_SECRET!,
//       { expiresIn: this.REFRESH_EXPIRES }
//     );
//   }

//   verifyAccessToken(token: string): JwtPayload | IJwtPayload {
//     try {
//       return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload | IJwtPayload;
//     } catch {
//       throw new ApiError(401, "Invalid or expired access token.");
//     }
//   }

//   verifyRefreshToken(token: string): JwtPayload | IJwtPayload {
//     try {
//       return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload | IJwtPayload;
//     } catch {
//       throw new ApiError(401, "Invalid or expired refresh token.");
//     }
//   }



//   async registerUser(data:RegisterUser) : Promise<IUser>{
//     const { name, username, email, password } = data;

//     const existingEmail = await User.findOne({ email });

//     if (existingEmail) {
//       throw new ApiError(409, "Email is already registered.");
//     }


//     const existingUsername = await User.findOne({ username });

//     if (existingUsername) {
//       throw new ApiError(409, "Username is already taken.");
//     }

//     const hashedPassword = await this.hashPassword(password);

  
//     const user: IUserDocument = await User.create({
//       name,
//       username,
//       email,
//       password: hashedPassword,
//       provider:"email"
//     });

//     return {
//       _id: user._id.toString(),
//       name: user.name,
//       username: user.username,
//       email: user.email,
//       avatar: user.avatar,
//     };
//   }


// async loginUser(data: LoginUser): Promise<LoginResponse> {
  

//   const { email, password } = data;

//   const user = await User.findOne({ email }).select("+password +refreshToken");
  

//   if (!user) {
//     throw new ApiError(404, "User does not exist");
//   }

//   const isValidPassword = await this.comparePassword(password, user.password);
  

//   if (!isValidPassword) {
//     throw new ApiError(401, "Invalid email or password");
//   }

//   const payload: IJwtPayload = {
//     _id: user._id.toString(),
//     email: user.email,
//     username: user.username,
//   };
  

//   const accessToken = this.generateAccessToken(payload);
  

//   const refreshToken = this.generateRefreshToken(payload);


//   user.refreshToken = refreshToken;
//   user.lastLoginAt = new Date();

//   await user.save({ validateBeforeSave: false });


//   return {
//     user: {
//       _id: user._id.toString(),
//       name: user.name,
//       username: user.username,
//       email: user.email,
//       avatar: user.avatar,
//     },
//     accessToken,
//     refreshToken,
//   };
// }

// async logoutUser(userId: string): Promise<void> {
//   const user = await User.findById(userId).select("+refreshToken");

//   if (!user) {
//     throw new ApiError(404, "User not found.");
//   }

//   user.refreshToken = undefined;

//   await user.save({ validateBeforeSave: false });
// }


// async refreshAccessToken(refreshToken: string): Promise<string> {
//   const payload = this.verifyRefreshToken(refreshToken) as IJwtPayload;

//   const user = await User.findById(payload._id).select("+refreshToken");

//   if (!user) {
//     throw new ApiError(401, "User not found.");
//   }

  
//   if (user.refreshToken !== refreshToken) {
//     throw new ApiError(401, "Invalid refresh token.");
//   }

//   const accessToken = this.generateAccessToken({
//     _id: user._id.toString(),
//     email: user.email,
//     username: user.username,
//   });

//   return accessToken;
// }

// async getCurrentUser(userID:string) : Promise<currentUser>{
//   const user = await User.findById(userID).select("-password");
//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   return{
//     user:{
//       _id: user._id.toString(),
//       name: user.name,
//       username: user.username,
//       email: user.email,
//       avatar: user.avatar,
//     }
    
//   }
// }
// async forgotPassword(email:string) : Promise<void>{
//   const user = await User.findOne({email});
//   if(!user){
//     return;
//   }
//   const otp = await OtpService.createOtp(email);
//   await MailService.sendOtpEmail(email, otp);
// }

// async verifyOtpResetPassword(email: string, otp: string): Promise<ResetResponse> {

//     const otpRecord = await Otp.findOne({
//         email,
//         purpose: OtpPurpose.PASSWORD_RESET,
//     });

//     if (!otpRecord) {
//         throw new ApiError(404, "OTP not found or expired");
//     }
  
//     if (otpRecord.attempts >= 5) {
//     await otpRecord.deleteOne();

//     throw new ApiError(
//         429,
//         "Too many attempts. Please request a new OTP."
//     );
// }

//     if (otpRecord.expiresAt < new Date()) {
//         throw new ApiError(401, "OTP has expired");
//     }

//     const isValidOtp = await OtpService.verifyOtp(
//         otp,
//         otpRecord.otpHash
//     );

//     if (!isValidOtp) {
//         otpRecord.attempts += 1;

//         if (otpRecord.attempts >= 5) {
//             await otpRecord.deleteOne();

//             throw new ApiError(
//                 429,
//                 "Too many attempts. Please request a new OTP."
//             );
//         }

//         await otpRecord.save();

//         throw new ApiError(401, "Invalid OTP");
//     }

//     otpRecord.attempts = 0;
//     otpRecord.isVerified = true;
    
//     await otpRecord.save();

//     const resetToken = OtpService.generateResetToken(email);

//     return {
//     email,
//     resetToken,
// };
// }

// async resetPassword(
//     email: string,
//     resetToken: string,
//     newPassword: string
//   ): Promise<void> {
//     try {
//       const payload = OtpService.verifyResetToken(resetToken);
  
//       if (payload.email !== email) {
//     throw new ApiError(401, "Invalid or expired reset token");
// }
//       const otpRecord = await Otp.findOne({
//         email,
//         purpose: OtpPurpose.PASSWORD_RESET,
//         isVerified: true,
//       });

//       if (!otpRecord) {
//     throw new ApiError(
//         401,
//         "Reset session expired. Please request a new OTP."
//     );
// }
  
//       if (otpRecord.expiresAt < new Date()) {
//     await otpRecord.deleteOne();

//     throw new ApiError(
//         401,
//         "Reset session expired. Please request a new OTP."
//     );
// }
  
//       const user = await User.findOne({ email }).select("+password");
  
//       if (!user) {
//         throw new ApiError(404, "User not found");
//       }

//       const samePassword = await this.comparePassword(
//     newPassword,
//     user.password
// );

// if (samePassword) {
//     throw new ApiError(
//         400,
//         "New password cannot be the same as the old password."
//     );
// }
  
//       const hashedPassword = await this.hashPassword(newPassword);
  
//       user.password = hashedPassword;
  
//       await user.save({ validateBeforeSave: false });

//       await otpRecord!.deleteOne();
  
//     } catch (error: any) {
//       if (error.name === "JsonWebTokenError") {
//         throw new ApiError(401, "Invalid or expired reset token");
//       }
//       throw error;
//     }
//   } 

//   async resendResetOtp(email: string): Promise<void> {
//     const user = await User.findOne({ email });

//     if (!user) {
//         return;
//     }

//     const otp = await OtpService.createOtp(email);

//     await MailService.sendOtpEmail(email, otp);
// }

// }


// export default new AuthService();

import bcrypt from "bcryptjs";

import jwt, {
  type JwtPayload,
  type SignOptions,
} from "jsonwebtoken";

import {
  DomainEventName,
  eventBus,
} from "../../events";

import type {
  IJwtPayload,
  IUser,
  LoginResponse,
  LoginUser,
  RegisterUser,
  ResetResponse,
  currentUser,
} from "../../interfaces/user.interface";

import ApiError from "../../utils/ApiError";

import MailService from "../mail/mail.service";

import {
  Otp,
  OtpPurpose,
} from "../otp/otp.model";

import OtpService from "../otp/otp.service";

import {
  User,
  type IUserDocument,
} from "./auth.model";

interface MongoDuplicateKeyError {
  code: number;

  keyPattern?: Record<
    string,
    number
  >;
}

export class AuthService {
  private readonly ACCESS_EXPIRES:
    SignOptions["expiresIn"] =
      "15m";

  private readonly REFRESH_EXPIRES:
    SignOptions["expiresIn"] =
      "7d";

  /*
  |--------------------------------------------------------------------------
  | Password Utilities
  |--------------------------------------------------------------------------
  */

  async hashPassword(
    password: string
  ): Promise<string> {
    const salt =
      await bcrypt.genSalt(
        12
      );

    return bcrypt.hash(
      password,
      salt
    );
  }

  async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(
      plainPassword,
      hashedPassword
    );
  }

  /*
  |--------------------------------------------------------------------------
  | JWT Utilities
  |--------------------------------------------------------------------------
  */

  private getAccessTokenSecret():
    string {
    const secret =
      process.env
        .ACCESS_TOKEN_SECRET;

    if (
      !secret
    ) {
      throw new ApiError(
        500,
        "Access-token configuration is unavailable."
      );
    }

    return secret;
  }

  private getRefreshTokenSecret():
    string {
    const secret =
      process.env
        .REFRESH_TOKEN_SECRET;

    if (
      !secret
    ) {
      throw new ApiError(
        500,
        "Refresh-token configuration is unavailable."
      );
    }

    return secret;
  }

  private isJwtPayload(
    decoded:
      string |
      JwtPayload
  ): decoded is IJwtPayload {
    if (
      typeof decoded !==
        "object" ||
      decoded === null
    ) {
      return false;
    }

    return (
      typeof decoded._id ===
        "string" &&
      decoded._id.length > 0 &&
      typeof decoded.email ===
        "string" &&
      typeof decoded.username ===
        "string" &&
      Number.isInteger(
        decoded.sessionVersion
      ) &&
      Number(
        decoded.sessionVersion
      ) >= 0
    );
  }

  private resolveSessionVersion(
    value: unknown
  ): number {
    return (
      Number.isInteger(
        value
      ) &&
      Number(
        value
      ) >= 0
    )
      ? Number(
          value
        )
      : 0;
  }

  private buildJwtPayload(
    user: Pick<
      IUserDocument,
      | "_id"
      | "email"
      | "username"
      | "sessionVersion"
    >
  ): IJwtPayload {
    return {
      _id:
        user._id.toString(),

      email:
        user.email,

      username:
        user.username,

      sessionVersion:
        this.resolveSessionVersion(
          user.sessionVersion
        ),
    };
  }

  generateAccessToken(
    payload: IJwtPayload
  ): string {
    return jwt.sign(
      payload,
      this.getAccessTokenSecret(),
      {
        expiresIn:
          this.ACCESS_EXPIRES,
      }
    );
  }

  generateRefreshToken(
    payload: IJwtPayload
  ): string {
    return jwt.sign(
      payload,
      this.getRefreshTokenSecret(),
      {
        expiresIn:
          this.REFRESH_EXPIRES,
      }
    );
  }

  verifyAccessToken(
    token: string
  ): IJwtPayload {
    try {
      const decoded =
        jwt.verify(
          token,
          this.getAccessTokenSecret()
        );

      if (
        !this.isJwtPayload(
          decoded
        )
      ) {
        throw new ApiError(
          401,
          "Invalid or expired access token."
        );
      }

      return decoded;
    } catch (
      error
    ) {
      if (
        error instanceof
          ApiError
      ) {
        throw error;
      }

      throw new ApiError(
        401,
        "Invalid or expired access token."
      );
    }
  }

  verifyRefreshToken(
    token: string
  ): IJwtPayload {
    try {
      const decoded =
        jwt.verify(
          token,
          this.getRefreshTokenSecret()
        );

      if (
        !this.isJwtPayload(
          decoded
        )
      ) {
        throw new ApiError(
          401,
          "Invalid or expired refresh token."
        );
      }

      return decoded;
    } catch (
      error
    ) {
      if (
        error instanceof
          ApiError
      ) {
        throw error;
      }

      throw new ApiError(
        401,
        "Invalid or expired refresh token."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Registration
  |--------------------------------------------------------------------------
  */

  async registerUser(
    data: RegisterUser
  ): Promise<IUser> {
    const name =
      data.name.trim();

    const username =
      data.username.trim();

    const email =
      data.email
        .trim()
        .toLowerCase();

    const [
      existingEmail,
      existingUsername,
    ] =
      await Promise.all([
        User.exists({
          email,
          deletedAt:
            null,
        }),

        User.exists({
          username,
          deletedAt:
            null,
        }),
      ]);

    if (
      existingEmail
    ) {
      throw new ApiError(
        409,
        "Email is already registered."
      );
    }

    if (
      existingUsername
    ) {
      throw new ApiError(
        409,
        "Username is already taken."
      );
    }

    const hashedPassword =
      await this.hashPassword(
        data.password
      );

    try {
      const user =
        await User.create({
          name,
          username,
          email,

          password:
            hashedPassword,

          provider:
            "email",

          sessionVersion:
            0,
        });

      return {
        _id:
          user._id.toString(),

        name:
          user.name,

        username:
          user.username,

        email:
          user.email,

        avatar:
          user.avatar ??
          undefined,
      };
    } catch (
      error
    ) {
      if (
        this.isMongoDuplicateKeyError(
          error
        )
      ) {
        if (
          error.keyPattern
            ?.email
        ) {
          throw new ApiError(
            409,
            "Email is already registered."
          );
        }

        if (
          error.keyPattern
            ?.username
        ) {
          throw new ApiError(
            409,
            "Username is already taken."
          );
        }

        throw new ApiError(
          409,
          "An account with those details already exists."
        );
      }

      throw error;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  async loginUser(
    data: LoginUser
  ): Promise<LoginResponse> {
    const email =
      data.email
        .trim()
        .toLowerCase();

    const user =
      await User.findOne({
        email,
        deletedAt:
          null,
      }).select(
        [
          "+password",
          "+refreshToken",
          "+sessionVersion",
        ].join(
          " "
        )
      );

    /*
    Use one response for an unknown account, a deleted account,
    a provider-only account, and a wrong password.

    This avoids exposing whether an email is registered.
    */
    if (
      !user ||
      !user.password
    ) {
      throw new ApiError(
        401,
        "Invalid email or password."
      );
    }

    const isValidPassword =
      await this.comparePassword(
        data.password,
        user.password
      );

    if (
      !isValidPassword
    ) {
      throw new ApiError(
        401,
        "Invalid email or password."
      );
    }

    /*
    Existing accounts created before sessionVersion was introduced do not
    have the field in MongoDB. Migrate them lazily on their next successful
    login so the secure token format works without a destructive migration.
    */
    if (
      !Number.isInteger(
        user.sessionVersion
      ) ||
      user.sessionVersion <
        0
    ) {
      user.sessionVersion =
        0;
    }

    const payload =
      this.buildJwtPayload(
        user
      );

    const accessToken =
      this.generateAccessToken(
        payload
      );

    const refreshToken =
      this.generateRefreshToken(
        payload
      );

    user.refreshToken =
      refreshToken;

    user.lastLoginAt =
      new Date();

    await user.save({
      validateBeforeSave:
        false,
    });

    return {
      user: {
        _id:
          user._id.toString(),

        name:
          user.name,

        username:
          user.username,

        email:
          user.email,

        avatar:
          user.avatar ??
          undefined,
      },

      accessToken,
      refreshToken,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Logout / Revoke All Current Sessions
  |--------------------------------------------------------------------------
  */

  async logoutUser(
    userId: string
  ): Promise<void> {
    const user =
      await User.findOneAndUpdate(
        {
          _id:
            userId,

          deletedAt:
            null,
        },
        {
          $set: {
            refreshToken:
              null,
          },

          $inc: {
            sessionVersion:
              1,
          },
        },
        {
          new:
            true,

          select:
            "_id +sessionVersion",
        }
      );

    if (
      !user
    ) {
      throw new ApiError(
        401,
        "User account is unavailable."
      );
    }

    await eventBus.publish(
      DomainEventName
        .USER_SESSION_REVOKED,
      {
        userId:
          user._id.toString(),

        reason:
          "logout",
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Refresh Access Token
  |--------------------------------------------------------------------------
  */

  async refreshAccessToken(
    refreshToken: string
  ): Promise<string> {
    const payload =
      this.verifyRefreshToken(
        refreshToken
      );

    const user =
      await User.findOne({
        _id:
          payload._id,

        deletedAt:
          null,
      }).select(
        [
          "_id",
          "email",
          "username",
          "+refreshToken",
          "+sessionVersion",
        ].join(
          " "
        )
      );

    if (
      !user
    ) {
      throw new ApiError(
        401,
        "User account is unavailable."
      );
    }

    if (
      user.sessionVersion !==
      payload.sessionVersion
    ) {
      throw new ApiError(
        401,
        "Your session has been revoked. Please sign in again."
      );
    }

    if (
      !user.refreshToken ||
      user.refreshToken !==
        refreshToken
    ) {
      throw new ApiError(
        401,
        "Invalid refresh token."
      );
    }

    return this
      .generateAccessToken(
        this.buildJwtPayload(
          user
        )
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Current Authenticated User
  |--------------------------------------------------------------------------
  */

  async getCurrentUser(
    userId: string
  ): Promise<currentUser> {
    const user =
      await User.findOne({
        _id:
          userId,

        deletedAt:
          null,
      }).select(
        [
          "_id",
          "name",
          "username",
          "email",
          "avatar",
        ].join(
          " "
        )
      );

    if (
      !user
    ) {
      throw new ApiError(
        404,
        "User not found."
      );
    }

    return {
      user: {
        _id:
          user._id.toString(),

        name:
          user.name,

        username:
          user.username,

        email:
          user.email,

        avatar:
          user.avatar ??
          undefined,
      },
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Forgot Password
  |--------------------------------------------------------------------------
  */

  async forgotPassword(
    emailInput: string
  ): Promise<void> {
    const email =
      emailInput
        .trim()
        .toLowerCase();

    const userExists =
      await User.exists({
        email,
        provider:
          "email",

        deletedAt:
          null,
      });

    /*
    Always return silently for unknown/unavailable accounts.
    The controller uses a generic response to prevent account enumeration.
    */
    if (
      !userExists
    ) {
      return;
    }

    const otp =
      await OtpService
        .createOtp(
          email
        );

    await MailService
      .sendOtpEmail(
        email,
        otp
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Verify Password-Reset OTP
  |--------------------------------------------------------------------------
  */

  async verifyOtpResetPassword(
    emailInput: string,
    otp: string
  ): Promise<ResetResponse> {
    const email =
      emailInput
        .trim()
        .toLowerCase();

    const otpRecord =
      await Otp.findOne({
        email,

        purpose:
          OtpPurpose
            .PASSWORD_RESET,
      });

    if (
      !otpRecord
    ) {
      throw new ApiError(
        404,
        "OTP not found or expired."
      );
    }

    if (
      otpRecord.attempts >=
      5
    ) {
      await otpRecord
        .deleteOne();

      throw new ApiError(
        429,
        "Too many attempts. Please request a new OTP."
      );
    }

    if (
      otpRecord.expiresAt <=
      new Date()
    ) {
      await otpRecord
        .deleteOne();

      throw new ApiError(
        401,
        "OTP has expired."
      );
    }

    const isValidOtp =
      await OtpService
        .verifyOtp(
          otp,
          otpRecord
            .otpHash
        );

    if (
      !isValidOtp
    ) {
      otpRecord.attempts +=
        1;

      if (
        otpRecord.attempts >=
        5
      ) {
        await otpRecord
          .deleteOne();

        throw new ApiError(
          429,
          "Too many attempts. Please request a new OTP."
        );
      }

      await otpRecord.save();

      throw new ApiError(
        401,
        "Invalid OTP."
      );
    }

    otpRecord.attempts =
      0;

    otpRecord.isVerified =
      true;

    await otpRecord.save();

    const resetToken =
      OtpService
        .generateResetToken(
          email
        );

    return {
      email,
      resetToken,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Reset Password
  |--------------------------------------------------------------------------
  */

  async resetPassword(
    emailInput: string,
    resetToken: string,
    newPassword: string
  ): Promise<void> {
    const email =
      emailInput
        .trim()
        .toLowerCase();

    const resetPayload =
      OtpService
        .verifyResetToken(
          resetToken
        );

    if (
      resetPayload.email
        .trim()
        .toLowerCase() !==
      email
    ) {
      throw new ApiError(
        401,
        "Invalid or expired reset token."
      );
    }

    const user =
      await User.findOne({
        email,
        provider:
          "email",

        deletedAt:
          null,
      }).select(
        [
          "+password",
          "+refreshToken",
          "+sessionVersion",
        ].join(
          " "
        )
      );

    if (
      !user ||
      !user.password
    ) {
      throw new ApiError(
        401,
        "Reset session is unavailable. Please request a new OTP."
      );
    }

    const samePassword =
      await this.comparePassword(
        newPassword,
        user.password
      );

    if (
      samePassword
    ) {
      throw new ApiError(
        400,
        "New password cannot be the same as the old password."
      );
    }

    const hashedPassword =
      await this.hashPassword(
        newPassword
      );

    /*
    Atomically consume the verified OTP before changing the password.

    This prevents the same reset session from being used twice. If the later
    password update fails because of a concurrent account change, the user
    must request a new OTP rather than reusing a potentially compromised
    reset session.
    */
    const consumedOtp =
      await Otp.findOneAndDelete({
        email,

        purpose:
          OtpPurpose
            .PASSWORD_RESET,

        isVerified:
          true,

        expiresAt: {
          $gt:
            new Date(),
        },
      });

    if (
      !consumedOtp
    ) {
      throw new ApiError(
        401,
        "Reset session expired. Please request a new OTP."
      );
    }

    const updatedUser =
      await User.findOneAndUpdate(
        {
          _id:
            user._id,

          password:
            user.password,

          deletedAt:
            null,
        },
        {
          $set: {
            password:
              hashedPassword,

            passwordChangedAt:
              new Date(),

            refreshToken:
              null,
          },

          $inc: {
            sessionVersion:
              1,
          },
        },
        {
          new:
            true,

          select:
            "_id +sessionVersion",
        }
      );

    if (
      !updatedUser
    ) {
      throw new ApiError(
        409,
        "The account changed while resetting the password. Please request a new OTP."
      );
    }

    await Otp.deleteMany({
      email,

      purpose:
        OtpPurpose
          .PASSWORD_RESET,
    });

    await eventBus.publish(
      DomainEventName
        .USER_SESSION_REVOKED,
      {
        userId:
          updatedUser
            ._id
            .toString(),

        reason:
          "password_reset",
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Resend Password-Reset OTP
  |--------------------------------------------------------------------------
  */

  async resendResetOtp(
    emailInput: string
  ): Promise<void> {
    const email =
      emailInput
        .trim()
        .toLowerCase();

    const userExists =
      await User.exists({
        email,
        provider:
          "email",

        deletedAt:
          null,
      });

    if (
      !userExists
    ) {
      return;
    }

    const otp =
      await OtpService
        .createOtp(
          email
        );

    await MailService
      .sendOtpEmail(
        email,
        otp
      );
  }

  private isMongoDuplicateKeyError(
    error: unknown
  ): error is MongoDuplicateKeyError {
    return (
      typeof error ===
        "object" &&
      error !== null &&
      "code" in error &&
      (
        error as {
          code?: unknown;
        }
      ).code ===
        11000
    );
  }
}

export default new AuthService();