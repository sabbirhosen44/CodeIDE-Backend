import { NextFunction, Request, Response } from "express";
import config from "../config/default.js";
import User from "../models/UserSchema.js";
import { sendVerificationEmail } from "../services/emails/emails.js";
import { IUser } from "../types/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(
        new ErrorResponse("Name, Email & Password are required!", 400)
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new ErrorResponse("Email is already registered", 400));
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${config.clientUrl}/verify-email/${verificationToken}`;

    try {
      await sendVerificationEmail(user.email, verificationUrl);

      sendTokenResponse(user, 201, res);
    } catch (error) {
      console.log(error);

      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse("Email could not be send", 500));
    }
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password)
      return next(
        new ErrorResponse("Please provide an email and password", 400)
      );

    const user = await User.findOne({ email }).select("+password");

    if (!user) return next(new ErrorResponse("Invalid credentials", 401));

    const isMatch = await user.matchPassword(password);

    if (!isMatch) return next(new ErrorResponse("Invalid credentials", 401));

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

const sendTokenResponse = (
  user: IUser,
  statusCode: number,
  res: Response
): void => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      isEmailVerified: user.isEmailVerified,
    },
  });
};
