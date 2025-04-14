import { NextFunction, Request, Response } from "express";
import User from "../models/UserSchema.js";
import ErrorResponse from "../utils/errorResponse.js";
import { IUser } from "../types/index.js";
import config from "../config/default.js";
import { sendVerificationEmail } from "../services/emails/emails.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorResponse("Name, Email & Password are required!", 400));
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new ErrorResponse("User already exist", 400));
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${config.clientUrl}/verify-email/${verificationToken}`;

    await sendVerificationEmail(user.email, verificationUrl);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.log(error);

    return;
  }
};

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
