import { NextFunction, Response } from "express";
import { RequestWithUser } from "../types/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/default.js";
import User from "../models/UserSchema.js";

export const protect = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new ErrorResponse("Not authorized to access route", 401));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new ErrorResponse("User not found", 401));
      }

      req.user = user;
      next();
    } catch (error) {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }
  }
);

export const authorize = (...roles: string[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user?.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
