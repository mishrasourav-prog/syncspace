import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IJwtPayload, IUser } from "../../interfaces/user.interface";
import ApiError from "../../utils/ApiError";
import { LoginUser , RegisterUser , LoginResponse , currentUser , ResetResponse} from "../../interfaces/user.interface";
import { User } from "./auth.model";
import { IUserDocument } from "./auth.model";
import OtpService from "../otp/otp.service";
import  MailService  from "../mail/mail.service";
import { Otp } from "../otp/otp.model";
import { OtpPurpose } from "../otp/otp.model";



export class AuthService {


  private readonly ACCESS_EXPIRES = "15m";
  private readonly REFRESH_EXPIRES = "7d";


  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  generateAccessToken(payload: IJwtPayload): string {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: this.ACCESS_EXPIRES,
    });
  }


  generateRefreshToken(payload: IJwtPayload): string {
    return jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: this.REFRESH_EXPIRES }
    );
  }

  verifyAccessToken(token: string): JwtPayload | IJwtPayload {
    try {
      return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload | IJwtPayload;
    } catch {
      throw new ApiError(401, "Invalid or expired access token.");
    }
  }

  verifyRefreshToken(token: string): JwtPayload | IJwtPayload {
    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload | IJwtPayload;
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token.");
    }
  }



  async registerUser(data:RegisterUser) : Promise<IUser>{
    const { name, username, email, password } = data;

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      throw new ApiError(409, "Email is already registered.");
    }


    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      throw new ApiError(409, "Username is already taken.");
    }

    const hashedPassword = await this.hashPassword(password);

  
    const user: IUserDocument = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      provider:"email"
    });

    return {
      _id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    };
  }


async loginUser(data: LoginUser): Promise<LoginResponse> {
  

  const { email, password } = data;

  const user = await User.findOne({ email }).select("+password +refreshToken");
  

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isValidPassword = await this.comparePassword(password, user.password);
  

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid email or password");
  }

  const payload: IJwtPayload = {
    _id: user._id.toString(),
    email: user.email,
    username: user.username,
  };
  

  const accessToken = this.generateAccessToken(payload);
  

  const refreshToken = this.generateRefreshToken(payload);


  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();

  await user.save({ validateBeforeSave: false });


  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
}

async logoutUser(userId: string): Promise<void> {
  const user = await User.findById(userId).select("+refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.refreshToken = undefined;

  await user.save({ validateBeforeSave: false });
}


async refreshAccessToken(refreshToken: string): Promise<string> {
  const payload = this.verifyRefreshToken(refreshToken) as IJwtPayload;

  const user = await User.findById(payload._id).select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "User not found.");
  }

  
  if (user.refreshToken !== refreshToken) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  const accessToken = this.generateAccessToken({
    _id: user._id.toString(),
    email: user.email,
    username: user.username,
  });

  return accessToken;
}

async getCurrentUser(userID:string) : Promise<currentUser>{
  const user = await User.findById(userID).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return{
    user:{
      _id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    }
    
  }
}
async forgotPassword(email:string) : Promise<void>{
  const user = await User.findOne({email});
  if(!user){
    return;
  }
  const otp = await OtpService.createOtp(email);
  await MailService.sendOtpEmail(email, otp);
}

async verifyOtpResetPassword(email: string, otp: string): Promise<ResetResponse> {

    const otpRecord = await Otp.findOne({
        email,
        purpose: OtpPurpose.PASSWORD_RESET,
    });

    if (!otpRecord) {
        throw new ApiError(404, "OTP not found or expired");
    }
  
    if (otpRecord.attempts >= 5) {
    await otpRecord.deleteOne();

    throw new ApiError(
        429,
        "Too many attempts. Please request a new OTP."
    );
}

    if (otpRecord.expiresAt < new Date()) {
        throw new ApiError(401, "OTP has expired");
    }

    const isValidOtp = await OtpService.verifyOtp(
        otp,
        otpRecord.otpHash
    );

    if (!isValidOtp) {
        otpRecord.attempts += 1;

        if (otpRecord.attempts >= 5) {
            await otpRecord.deleteOne();

            throw new ApiError(
                429,
                "Too many attempts. Please request a new OTP."
            );
        }

        await otpRecord.save();

        throw new ApiError(401, "Invalid OTP");
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
    email: string,
    resetToken: string,
    newPassword: string
  ): Promise<void> {
    try {
      const payload = OtpService.verifyResetToken(resetToken);
  
      if (payload.email !== email) {
    throw new ApiError(401, "Invalid or expired reset token");
}
      const otpRecord = await Otp.findOne({
        email,
        purpose: OtpPurpose.PASSWORD_RESET,
        isVerified: true,
      });

      if (!otpRecord) {
    throw new ApiError(
        401,
        "Reset session expired. Please request a new OTP."
    );
}
  
      if (otpRecord.expiresAt < new Date()) {
    await otpRecord.deleteOne();

    throw new ApiError(
        401,
        "Reset session expired. Please request a new OTP."
    );
}
  
      const user = await User.findOne({ email }).select("+password");
  
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      const samePassword = await this.comparePassword(
    newPassword,
    user.password
);

if (samePassword) {
    throw new ApiError(
        400,
        "New password cannot be the same as the old password."
    );
}
  
      const hashedPassword = await this.hashPassword(newPassword);
  
      user.password = hashedPassword;
  
      await user.save({ validateBeforeSave: false });

      await otpRecord!.deleteOne();
  
    } catch (error: any) {
      if (error.name === "JsonWebTokenError") {
        throw new ApiError(401, "Invalid or expired reset token");
      }
      throw error;
    }
  } 

  async resendResetOtp(email: string): Promise<void> {
    const user = await User.findOne({ email });

    if (!user) {
        return;
    }

    const otp = await OtpService.createOtp(email);

    await MailService.sendOtpEmail(email, otp);
}

}


export default new AuthService();
