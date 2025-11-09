import { Request, Response, NextFunction } from "express";
import {
  checkOTPRestrictions,
  sendOTP,
  trackOTPRequests,
  validateRegistrationData,
} from "../utils/auth.helper";
import { ValidationError } from "@eshop/shared-types";
import { UserModel } from "@eshop/utils";

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

    const existingUser = await UserModel.findOne({ where: email });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await checkOTPRestrictions(email, next);
    await trackOTPRequests(email, next);
    await sendOTP(name, email, "user_activation_mail");

    return res.status(200).json({
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    return next(error);
  }
};
