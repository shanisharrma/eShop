import { ValidationError } from "@eshop/shared-types";
import { redis, sendEmail } from "@eshop/utils";
import crypto from "crypto";
import { NextFunction } from "express";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError(`Missing required fields!`);
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError(`Invalid email format!`);
  }
};

export const checkOTPRestrictions = async (
  email: string,
  next: NextFunction
) => {
  // This check if for invalid attempts of OTP verification
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        "Account locked die to multiple failed attempts! Try again after 30 minutes"
      )
    );
  }

  // This check if for when user exceeded the limit for requesting verification OTP (i.e., 3 times consecutively)
  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        "Too many OTP requests! Please wait 1 hour before requesting again."
      )
    );
  }

  // This check if for halting the user to request for another OTP after 60 seconds
  if (await redis.get(`otp_cool_down:${email}`)) {
    return next(
      new ValidationError("Please wait 1 minute before requesting for new OTP!")
    );
  }
};

/**
 * Tracking the OTP verification requests
 * @param email
 * @param next
 * @returns
 */
export const trackOTPRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

  // if the otp requests exceeds 3 times then the email (user) will be locked for 1 hour before making another request.
  if (otpRequests >= 3) {
    await redis.set(`otp_spam_lock:${email}`, "true", "EX", 3600);
    return next(
      new ValidationError(
        "too many OTP requests. Please wait 1 hour before requesting again."
      )
    );
  }

  await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600);
};

export const sendOTP = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, "Verify Your Email", template, { name, otp });
  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cool_down:${email}`, "true", "EX", 60);
};

export const verifyOTP = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOTP = await redis.get(`otp:${email}`);
  if (!storedOTP) {
    throw new ValidationError("Invalid or expired OTP!");
  }

  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

  if (storedOTP !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, "locked", "EX", 1800);
      await redis.del(`otp:${email}`, failedAttemptsKey);
      throw new ValidationError(
        "Too many failed attempts. Your account is locked for 30 minutes!"
      );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);
    throw new ValidationError(
      `Incorrect OTP. ${2 - failedAttempts} attempts left.`
    );
  }

  await redis.del(`otp:${email}`, failedAttemptsKey);
};
