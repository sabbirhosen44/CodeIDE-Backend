import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import config from "../config/default.js";
import mongoose, { Schema } from "mongoose";
import type { IUser } from "../types/index.js";
import crypto from "crypto";

const UserSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
    maxLength: [50, "Name can't be more that 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minLength: [6, "Password must be atleast 6 characters"],
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  plan: {
    type: String,
    enum: ["free", "pro", "team"],
    default: "free",
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  avatarUrl: {
    type: String,
  },
  bio: {
    type: String,
    maxLength: [50, "Bio can't be more that 50 characters"],
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.getSignedJwtToken = function (): string {
  return jwt.sign({ id: this._id }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  } as SignOptions);
};

UserSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function (): string {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

UserSchema.methods.getEmailVerificationToken = function (): string {
  const verificationToken = crypto.randomBytes(20).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return verificationToken;
};

export default mongoose.model<IUser>("User", UserSchema);
