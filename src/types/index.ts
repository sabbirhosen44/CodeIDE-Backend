import { Document } from "mongoose";

export interface Config {
  port: number;
  mongoURI: string;
  jwtSecret: string;
  jwtExpire: string;
  corsOrigin: string;
}

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  plan: string;
  isEmailVerified: boolean;
  avatarUrl?: string;
  bio?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  emailVerificationToken?: string;
  emailVerificationExpire?: Date;
  lastLogin?: Date;
  createdAt: Date;
  getSignedJwtToken(): string;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getResetPasswordToken(): string;
  getEmailVerificationToken(): string;
}
