import { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/UserSchema.js";

export const getUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, search, role, plan } = req.query;

    let query: any = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    if (role) {
      query.role = role;
    }

    if (plan) {
      query.plan = plan;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select("-password")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      message: "Fetched all users successfuly",
      data: users,
      total,
      page,
      pages: Math.ceil(total / Number(limit)),
    });
  }
);

export const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const getUserDetails = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const updateUserPlan = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
