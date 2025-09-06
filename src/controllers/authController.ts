import { NextFunction, Request, Response } from "express";
import config from "../config/default.js";
import User from "../models/UserSchema.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../services/emails/emails.js";
import { IUser, RequestWithUser } from "../types/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";
import crypto from "crypto";

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
      role: email === process.env.ADMIN_EMAIL ? "admin" : "user",
      plan: "free",
      isEmailVerified: false,
    });

    const verificationToken = user.getEmailVerificationToken();
    console.log("verification token: ", verificationToken);

    const verificationUrl = `${config.clientUrl}/verify-email/${verificationToken}`;
    console.log("verification url : ", verificationUrl);

    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationEmail(user.email, verificationUrl);
      console.log("email sended!");

      sendTokenResponse(user, 201, res);
    } catch (error) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse("Email could not be send", 500));
    }
  }
);

export const verifyEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log("Email verification started");
    console.log("Token received:", req.params.verificationToken);

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.verificationToken)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    console.log("user found : ", user);

    if (!user) {
      return next(new ErrorResponse("Invalid or expired token", 400));
    }

    user.isEmailVerified = true;
    await user.save();

    sendTokenResponse(user, 200, res);
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
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

    if (!user.isEmailVerified) {
      return next(
        new ErrorResponse("Please verify your email before logging in", 403)
      );
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.status(200).json({
      success: true,
      message: "",
    });
  }
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return next(new ErrorResponse("There is no user with that email", 404));

    const resetToken = user.getResetPasswordToken();
    console.log(resetToken);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      res
        .status(200)
        .json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.log(error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { password: enteredPassword } = req.body;
    console.log(req.params);

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken.trim())
      .digest("hex");

    console.log(resetPasswordToken);

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return next(new ErrorResponse("Invalid token", 400));

    user.password = enteredPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
  }
);

export const getMe = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const user = await User.findById(req.user?._id);

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

export const updateProfile = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { name, email } = req.body;

    if (email && email !== req.user?.email) {
      const existingUser = await User.findOne({ email, _id: req.user?._id });
      if (existingUser) {
        return next(new ErrorResponse("Email is already taken", 400));
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

export const changePassword = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { password: newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    if (!user) return next(new ErrorResponse("User not found.", 404));

    user.password = newPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  }
);

export const deleteAccount = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    await User.findByIdAndDelete(req.user?._id);

    res
      .status(200)
      .json({ success: true, message: "User account deleted successfuly" });
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
