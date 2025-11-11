import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  checkOTPRestrictions,
  sendOTP,
  trackOTPRequests,
  validateRegistrationData,
  verifyOTP,
} from "../utils/auth.helper";
import { AuthError, NotFoundError, ValidationError } from "@eshop/shared-types";
import { UserModel } from "@eshop/utils";
import { setCookie } from "../utils/cookies/setCookie";

/**
 * Register a new user
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;

    const existingUser = await UserModel.findOne({ email: email });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await checkOTPRestrictions(email, next);
    await trackOTPRequests(email, next);
    await sendOTP(name, email, "user-activation-mail");

    return res.status(200).json({
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    return next(error);
  }
};

// Verify User OTP
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!name || !email || !password || !otp) {
      return next(new ValidationError("All Fields are required!"));
    }

    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await verifyOTP(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(typeof hashedPassword, hashedPassword);
    await UserModel.create({ name, email, password: hashedPassword });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
    });
  } catch (error) {
    console.log("Error Verifying User:", error);
    return next(error);
  }
};

// Resend OTP
export const resendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) return next(new ValidationError("Email is required!"));

    // Find user/seller in DB
    const user = await UserModel.findOne({ email: email });

    if (!user) return next(new NotFoundError("User not found!"));

    await checkOTPRestrictions(email, next);
    await trackOTPRequests(email, next);

    // Generate OTP and send Email
    await sendOTP(email, user.name as string, "user-activation-mail");

    res.status(200).json({
      success: true,
      message: "OTP sent to email, Please verify your account.",
    });
  } catch (error) {
    console.log("Error User forget password:", error);
    return next(error);
  }
};

// Login User
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError("Credentials are required!"));
    }

    const user = await UserModel.findOne({ email: email });

    console.log("user: ", user);

    if (!user) return next(new AuthError("User doesn't exists!"));

    // verify Password
    const isMatch = await bcrypt.compare(password, user.password! as string);
    if (!isMatch) return next(new AuthError("Invalid credentials!"));

    // Generate access and refresh token
    const accessToken = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user._id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    // store the refresh and access token in an httpOnly secure cookie
    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.log("Error Verifying User:", error);
    return next(error);
  }
};

// User Forgot Password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) return next(new ValidationError("Email is required!"));

    // Find user/seller in DB
    const user = await UserModel.findOne({ email: email });

    if (!user) return next(new NotFoundError("User not found!"));

    await checkOTPRestrictions(email, next);
    await trackOTPRequests(email, next);

    // Generate OTP and send Email
    await sendOTP(email, user.name as string, "forgot-password-user-mail");

    res.status(200).json({
      success: true,
      message: "OTP sent to email, Please verify your account.",
    });
  } catch (error) {
    console.log("Error User forget password:", error);
    return next(error);
  }
};

// Verify Forgot password OTP
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) return next(new ValidationError("Email is required!"));

    // Find user/seller in DB
    const user = await UserModel.findOne({ email: email });

    if (!user) return next(new NotFoundError("User not found!"));

    await verifyOTP(email, otp, next);

    res.status(200).json({
      success: true,
      message: "OTP verified. Please reset your account password.",
    });
  } catch (error) {
    console.log("Error Verify User forget password:", error);
    return next(error);
  }
};

// Reset User Password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return next(new ValidationError("Email and new password are required!"));

    // Find user/seller in DB
    const user = await UserModel.findOne({ email: email });

    if (!user) return next(new NotFoundError("User not found!"));

    // compare new password with the existing one
    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password as string
    );
    if (isSamePassword)
      return next(
        new ValidationError("New password can be same as old password!")
      );

    // hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserModel.findOneAndUpdate(
      { email: email },
      { password: hashedPassword }
    );

    res.status(200).json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (error) {
    console.log("Error password reset User:", error);
    return next(error);
  }
};
