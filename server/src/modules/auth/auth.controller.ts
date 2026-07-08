import { Request, Response, NextFunction } from "express";
import AuthService from "./auth.service";
import { registerUserSchema , loginUserSchema, forgotPasswordSchema , verifyOtpSchema , resetPasswordSchema , resendOtpSchema} from "./auth.validation";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";

export const registerUser = async(req:Request , res:Response , next:NextFunction) =>{
    try{
        const result = registerUserSchema.safeParse(req.body);

        if (!result.success) {
            throw new ApiError(400, result.error.message);
        }

        const user = await AuthService.registerUser(result.data);

        return res
        .status(201)
        .json(new ApiResponse(201, "User registered successfully.", user));
    }
    catch(error){
        next(error);
    }
};

export const loginUser = async(req:Request , res:Response , next:NextFunction) =>{
    try{
      console.log("1");
        const result = loginUserSchema.safeParse(req.body);
        console.log("2");

        if(!result.success){
            throw new ApiError(400,result.error.message);
        }
        console.log("3");

        const { user, accessToken, refreshToken } = await AuthService.loginUser(result.data);
        console.log("4");

        res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        })
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .json(
          new ApiResponse(200, "Login successful", {
            user,
          })
        );
        console.log("5");
    } catch (error) {
      next(error);
    }
};


export const logoutUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {

      if (!req.user) {
            throw new ApiError(401, "Unauthorized");
        }
      
    
      await AuthService.logoutUser(req.user._id);
  
      res
        .clearCookie("accessToken", {
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"strict",
})

.clearCookie("refreshToken", {
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"strict",
})
        .status(200)
        .json(new ApiResponse(200, "Logged out successfully"));
    } catch (error) {
      next(error);
    }
  };

export const refreshAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new ApiError(401, "Refresh token missing.");
        }

        const accessToken =
            await AuthService.refreshAccessToken(refreshToken);

        res
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000,
            })
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Session refreshed successfully."
                )
            );

    } catch (error) {
        next(error);
    }
};

  
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    if (!req.user) {
          throw new ApiError(401, "Unauthorized");
      }
    
  
    const payload = await AuthService.getCurrentUser(req.user._id);
    return res.status(200).json(
      new ApiResponse(
        200,
        "User fetched successfully",
        payload
      )
    );

  } catch (error) {
    return next(new ApiError(500, "Failed to fetch user"));
  }
};

export const forgotPassword = async(req:Request , res:Response , next:NextFunction) =>{
  try {
    const result = forgotPasswordSchema.safeParse(req.body);
    if(!result.success){
      throw new ApiError(400,result.error.message);
    }
    await AuthService.forgotPassword(result.data.email);
    return res.status(200).json(
      new ApiResponse(
        200,
        "If an account with that email exists, a password reset OTP has been sent."
      )
    );
  } catch (error) {
    next(error);
  }
}

export const verifyOtpResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = verifyOtpSchema.safeParse(req.body);

    if (!result.success) {
      throw new ApiError(400, result.error.message);
    }

    const payload = await AuthService.verifyOtpResetPassword(
      result.data.email,
      result.data.otp
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "OTP verified successfully.",
        payload
      )
    );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = resetPasswordSchema.safeParse(req.body);

    if (!result.success) {
      throw new ApiError(400, result.error.message);
    }

    await AuthService.resetPassword(
      result.data.email,
      result.data.resetToken,
      result.data.newPassword
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Password reset successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

export const resendResetOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = resendOtpSchema.safeParse(req.body);

        if (!result.success) {
            throw new ApiError(400, result.error.message);
        }

        await AuthService.resendResetOtp(result.data.email);

        return res.status(200).json(
            new ApiResponse(
                200,
                "OTP sent successfully."
            )
        );
    } catch (error) {
        next(error);
    }
};




