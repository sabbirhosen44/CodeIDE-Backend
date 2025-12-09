import { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/UserSchema.js";
import ErrorResponse from "../utils/errorResponse.js";
import Project from "../models/ProjectSchema.js";
import Snippet from "../models/SnippetSchema.js";

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
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  }
);

export const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: "User deleted Successfully!",
    });
  }
);

export const getUserDetails = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return next(new ErrorResponse("No user found", 404));
    }

    const projectCount = await Project.countDocuments({ owner: userId });

    const snippetCount = await Snippet.countDocuments({ owner: userId });

    const userWithCounts = {
      user,
      projectCount,
      snippetCount,
    };

    return res.status(200).json({
      success: true,
      message: "Fetched user details successfully",
      data: userWithCounts,
    });
  }
);

export const updateUserPlan = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
