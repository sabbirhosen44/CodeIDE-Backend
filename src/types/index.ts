import { Document } from "mongoose";
import type { Request as ExpressRequest } from "express";

export interface Config {
  port: number;
  mongoURI: string;
  jwtSecret: string;
  jwtExpire: string;
  clientUrl: string;
  smtpSettings: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
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

export interface ITemplateFile {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId?: string;
  content?: string;
  isExpanded?: boolean;
  children?: ITemplateFile[];
}

export interface ITemplate extends Document {
  _id: string;
  name: string;
  description: string;
  category:
    | "Frontend"
    | "Backend"
    | "Full Stack"
    | "Mobile"
    | "Desktop"
    | "Standalone"
    | "Library"
    | "Framework";
  language:
    | "JavaScript"
    | "TypeScript"
    | "Python"
    | "Java"
    | "C"
    | "C++"
    | "C#"
    | "PHP"
    | "Ruby"
    | "Go"
    | "Rust"
    | "Swift"
    | "Kotlin";
  framework?: string | null;
  tags: string[];
  files: ITemplateFile[];
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject extends Document {
  _id: string;
  name: string;
  description: string;
  templateId: string;
  files: ITemplateFile[];
  owner: string;
  lastModified: Date;
  createdAt: Date;
}

export interface RequestWithUser extends ExpressRequest {
  user?: IUser;
}
