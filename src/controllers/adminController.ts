import { Request, Response } from "express";
import Template from "../models/TemplateSchema.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAdminStats = asyncHandler(
  async (req: Request, res: Response) => {
    const totalTemplates = await Template.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalTemplates,
      },
    });
  }
);
