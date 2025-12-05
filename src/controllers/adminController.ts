import { Request, Response } from "express";
import User from "../models/UserSchema.js";
import Project from "../models/ProjectSchema.js";
import Snippet from "../models/SnippetSchema.js";
import Template from "../models/TemplateSchema.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAdminStats = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("ok");
    // Get basic counts
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalSnippets = await Snippet.countDocuments();
    const totalTemplates = await Template.countDocuments();

    const userGrowth = [];
    const projectGrowth = [];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const usersThisMonth = await User.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd },
      });

      const projectsThisMonth = await Project.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd },
      });

      userGrowth.push({
        month: months[date.getMonth()],
        users: usersThisMonth,
      });

      projectGrowth.push({
        month: months[date.getMonth()],
        projects: projectsThisMonth,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        totalSnippets,
        totalTemplates,
        userGrowth,
        projectGrowth,
      },
    });
  }
);
