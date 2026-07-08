
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Otp, OtpPurpose } from "./otp.model";
import jwt from "jsonwebtoken";
import ApiError from "../../utils/ApiError";


export class OtpService{

     generateOtp() : string{
        return crypto.randomInt(100000, 1000000).toString();
        
    }

    async hashOtp(otp: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(otp, salt);
    }

    async deleteExistingOtp(email:string) : Promise<void>{
        await Otp.deleteOne({
            email:email,
            purpose:OtpPurpose.PASSWORD_RESET

        })
    }

    async createOtp(email:string) : Promise<string>{
        const plainOtp = this.generateOtp();
        const hashedOtp = await this.hashOtp(plainOtp);
        await this.deleteExistingOtp(email);
        await Otp.create({
            email:email,
            otpHash:hashedOtp,
            expiresAt:new Date(Date.now() + 10 * 60 * 1000),
            attempts:0,
            purpose:OtpPurpose.PASSWORD_RESET

        })

        return plainOtp;


    }

    async verifyOtp(plainOtp:string , hashedOtp:string) : Promise<boolean>{
        
        return bcrypt.compare(plainOtp,hashedOtp);

    }
    generateResetToken(email: string): string {
    return jwt.sign(
        { email },
        process.env.RESET_TOKEN_SECRET!,
        {
            expiresIn: "10m",
        }
    );
}

     verifyResetToken(token: string){
        try {
          return jwt.verify(token, process.env.RESET_TOKEN_SECRET!) as { email: string };
        } catch {
          throw new ApiError(401, "Invalid or expired reset token.");
        }
      }

}

export default new OtpService();