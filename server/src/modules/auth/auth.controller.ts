// import { Request, Response, NextFunction } from "express";
// import AuthService from "./auth.service";
// import { registerUserSchema , loginUserSchema, forgotPasswordSchema , verifyOtpSchema , resetPasswordSchema , resendOtpSchema} from "./auth.validation";
// import ApiResponse from "../../utils/ApiResponse";
// import ApiError from "../../utils/ApiError";

// export const registerUser = async(req:Request , res:Response , next:NextFunction) =>{
//     try{
//         const result = registerUserSchema.safeParse(req.body);

//         if (!result.success) {
//             throw new ApiError(400, result.error.message);
//         }

//         const user = await AuthService.registerUser(result.data);

//         return res
//         .status(201)
//         .json(new ApiResponse(201, "User registered successfully.", user));
//     }
//     catch(error){
//         next(error);
//     }
// };

// export const loginUser = async(req:Request , res:Response , next:NextFunction) =>{
//     try{
  
//         const result = loginUserSchema.safeParse(req.body);
    

//         if(!result.success){
//             throw new ApiError(400,result.error.message);
//         }
    

//         const { user, accessToken, refreshToken } = await AuthService.loginUser(result.data);
    

//         res
//         .cookie("accessToken", accessToken, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "strict",
//           maxAge: 15 * 60 * 1000,
//         })
//         .cookie("refreshToken", refreshToken, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "strict",
//           maxAge: 7 * 24 * 60 * 60 * 1000,
//         })
//         .status(200)
//         .json(
//           new ApiResponse(200, "Login successful", {
//             user,
//           })
//         );
    
//     } catch (error) {
//       next(error);
//     }
// };


// export const logoutUser = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) => {
//     try {

//       if (!req.user) {
//             throw new ApiError(401, "Unauthorized");
//         }
      
    
//       await AuthService.logoutUser(req.user._id);
  
//       res
//         .clearCookie("accessToken", {
//     httpOnly:true,
//     secure:process.env.NODE_ENV==="production",
//     sameSite:"strict",
// })

// .clearCookie("refreshToken", {
//     httpOnly:true,
//     secure:process.env.NODE_ENV==="production",
//     sameSite:"strict",
// })
//         .status(200)
//         .json(new ApiResponse(200, "Logged out successfully"));
//     } catch (error) {
//       next(error);
//     }
//   };

// export const refreshAccessToken = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const refreshToken = req.cookies.refreshToken;

//         if (!refreshToken) {
//             throw new ApiError(401, "Refresh token missing.");
//         }

//         const accessToken =
//             await AuthService.refreshAccessToken(refreshToken);

//         res
//             .cookie("accessToken", accessToken, {
//                 httpOnly: true,
//                 secure: process.env.NODE_ENV === "production",
//                 sameSite: "strict",
//                 maxAge: 15 * 60 * 1000,
//             })
//             .status(200)
//             .json(
//                 new ApiResponse(
//                     200,
//                     "Session refreshed successfully."
//                 )
//             );

//     } catch (error) {
//         next(error);
//     }
// };

  
// export const getCurrentUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {

//     if (!req.user) {
//           throw new ApiError(401, "Unauthorized");
//       }
    
  
//     const payload = await AuthService.getCurrentUser(req.user._id);
//     return res.status(200).json(
//       new ApiResponse(
//         200,
//         "User fetched successfully",
//         payload
//       )
//     );

//   } catch (error) {
//     return next(error);
//   }
// };

// export const forgotPassword = async(req:Request , res:Response , next:NextFunction) =>{
//   try {
//     const result = forgotPasswordSchema.safeParse(req.body);
//     if(!result.success){
//       throw new ApiError(400,result.error.message);
//     }
//     await AuthService.forgotPassword(result.data.email);
//     return res.status(200).json(
//       new ApiResponse(
//         200,
//         "If an account with that email exists, a password reset OTP has been sent."
//       )
//     );
//   } catch (error) {
//     return next(error);
//   }
// }

// export const verifyOtpResetPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const result = verifyOtpSchema.safeParse(req.body);

//     if (!result.success) {
//       throw new ApiError(400, result.error.message);
//     }

//     const payload = await AuthService.verifyOtpResetPassword(
//       result.data.email,
//       result.data.otp
//     );

//     return res.status(200).json(
//       new ApiResponse(
//         200,
//         "OTP verified successfully.",
//         payload
//       )
//     );
//   } catch (error) {
//     next(error);
//   }
// };

// export const resetPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const result = resetPasswordSchema.safeParse(req.body);

//     if (!result.success) {
//       throw new ApiError(400, result.error.message);
//     }

//     await AuthService.resetPassword(
//       result.data.email,
//       result.data.resetToken,
//       result.data.newPassword
//     );

//     return res.status(200).json(
//       new ApiResponse(
//         200,
//         "Password reset successfully."
//       )
//     );
//   } catch (error) {
//     next(error);
//   }
// };

// export const resendResetOtp = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const result = resendOtpSchema.safeParse(req.body);

//         if (!result.success) {
//             throw new ApiError(400, result.error.message);
//         }

//         await AuthService.resendResetOtp(result.data.email);

//         return res.status(200).json(
//             new ApiResponse(
//                 200,
//                 "OTP sent successfully."
//             )
//         );
//     } catch (error) {
//         next(error);
//     }
// };


import type {
  CookieOptions,
  NextFunction,
  Request,
  Response,
} from "express";

import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

import AuthService from "./auth.service";

import {
  forgotPasswordSchema,
  loginUserSchema,
  registerUserSchema,
  resendOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "./auth.validation";

/*
|--------------------------------------------------------------------------
| Authentication Cookie Configuration
|--------------------------------------------------------------------------
|
| Keep cookie creation and removal aligned. A browser only removes a cookie
| reliably when the clearCookie options match the options used when it was
| created, especially path, secure, and sameSite.
|
*/

const isProduction =
  process.env.NODE_ENV ===
  "production";

const baseAuthCookieOptions:
  CookieOptions = {
    httpOnly: true,
    secure:
      isProduction,
    sameSite:
      "strict",
    path:
      "/",
  };

const accessTokenCookieOptions:
  CookieOptions = {
    ...baseAuthCookieOptions,
    maxAge:
      15 *
      60 *
      1000,
  };

const refreshTokenCookieOptions:
  CookieOptions = {
    ...baseAuthCookieOptions,
    maxAge:
      7 *
      24 *
      60 *
      60 *
      1000,
  };

const clearAuthenticationCookies = (
  res: Response
): Response => {
  res.clearCookie(
    "accessToken",
    baseAuthCookieOptions
  );

  res.clearCookie(
    "refreshToken",
    baseAuthCookieOptions
  );

  return res;
};

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

export const registerUser =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      /*
      schema.parse() deliberately allows the global error middleware to
      convert ZodError into the application's standard field-error shape.
      */
      const payload =
        registerUserSchema.parse(
          req.body
        );

      const user =
        await AuthService
          .registerUser(
            payload
          );

      return res
        .status(
          201
        )
        .json(
          new ApiResponse(
            201,
            "User registered successfully.",
            user
          )
        );
    } catch (
      error
    ) {
      return next(
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export const loginUser =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const payload =
        loginUserSchema.parse(
          req.body
        );

      const {
        user,
        accessToken,
        refreshToken,
      } =
        await AuthService
          .loginUser(
            payload
          );

      return res
        .cookie(
          "accessToken",
          accessToken,
          accessTokenCookieOptions
        )
        .cookie(
          "refreshToken",
          refreshToken,
          refreshTokenCookieOptions
        )
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "Login successful.",
            {
              user,
            }
          )
        );
    } catch (
      error
    ) {
      return next(
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

export const logoutUser =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (
        !req.user
      ) {
        throw new ApiError(
          401,
          "Authentication required."
        );
      }

      await AuthService
        .logoutUser(
          req.user._id
        );

      clearAuthenticationCookies(
        res
      );

      return res
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "Logged out successfully."
          )
        );
    } catch (
      error
    ) {
      /*
      Clear local cookies even when the database account/session is already
      unavailable. This avoids trapping the browser with unusable auth
      cookies while the global handler still returns the authoritative error.
      */
      clearAuthenticationCookies(
        res
      );

      return next(
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Refresh Access Token
|--------------------------------------------------------------------------
*/

export const refreshAccessToken =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const refreshToken =
        req.cookies
          ?.refreshToken;

      if (
        typeof refreshToken !==
          "string" ||
        refreshToken.length ===
          0
      ) {
        throw new ApiError(
          401,
          "Refresh token missing."
        );
      }

      const accessToken =
        await AuthService
          .refreshAccessToken(
            refreshToken
          );

      return res
        .cookie(
          "accessToken",
          accessToken,
          accessTokenCookieOptions
        )
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "Session refreshed successfully."
          )
        );
    } catch (
      error
    ) {
      /*
      A failed refresh means the presented refresh session cannot be trusted.
      Remove both browser cookies before forwarding the error.
      */
      clearAuthenticationCookies(
        res
      );

      return next(
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Current Authenticated User
|--------------------------------------------------------------------------
*/

export const getCurrentUser =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      if (
        !req.user
      ) {
        throw new ApiError(
          401,
          "Authentication required."
        );
      }

      const payload =
        await AuthService
          .getCurrentUser(
            req.user._id
          );

      return res
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "User fetched successfully.",
            payload
          )
        );
    } catch (
      error
    ) {
      return next(
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
*/

export const forgotPassword =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const payload =
        forgotPasswordSchema.parse(
          req.body
        );

      await AuthService
        .forgotPassword(
          payload.email
        );

      return res
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "If an account with that email exists, a password reset OTP has been sent."
          )
        );
    } catch (
      error
    ) {
      return next(
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Verify Password-Reset OTP
|--------------------------------------------------------------------------
*/

export const verifyOtpResetPassword =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const payload =
        verifyOtpSchema.parse(
          req.body
        );

      const result =
        await AuthService
          .verifyOtpResetPassword(
            payload.email,
            payload.otp
          );

      return res
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "OTP verified successfully.",
            result
          )
        );
    } catch (
      error
    ) {
      return next(
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

export const resetPassword =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const payload =
        resetPasswordSchema.parse(
          req.body
        );

      await AuthService
        .resetPassword(
          payload.email,
          payload.resetToken,
          payload.newPassword
        );

      /*
      The reset service invalidates every previous database/JWT session.
      Clear any cookies held by the current browser as well.
      */
      clearAuthenticationCookies(
        res
      );

      return res
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "Password reset successfully. Please sign in again."
          )
        );
    } catch (
      error
    ) {
      return next(
        error
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Resend Password-Reset OTP
|--------------------------------------------------------------------------
*/

export const resendResetOtp =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const payload =
        resendOtpSchema.parse(
          req.body
        );

      await AuthService
        .resendResetOtp(
          payload.email
        );

      /*
      Use the same enumeration-safe response whether or not the account
      exists.
      */
      return res
        .status(
          200
        )
        .json(
          new ApiResponse(
            200,
            "If an account with that email exists, a password reset OTP has been sent."
          )
        );
    } catch (
      error
    ) {
      return next(
        error
      );
    }
  };




