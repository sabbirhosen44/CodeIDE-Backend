import type { Response, NextFunction, Request } from "express";
import Template from "../models/TemplateSchema.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";
import type { RequestWithUser } from "../types/index.js";

export const getTemplates = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const {
      category,
      language,
      tags,
      search,
      sort = "-createdAt",
      page = 1,
      limit = 10,
    } = req.query;

    const query: any = {};

    if (category) query.category = category;
    if (language) query.language = language;
    if (tags) query.tags = { $in: (tags as string).split(",") };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const templates = await Template.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(Number(limit));

    const total = await Template.countDocuments(query);

    res.status(200).json({
      success: true,
      count: templates.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: templates,
    });
  }
);

export const createTemplate = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (req.body.framework === "none") {
      req.body.framework = null;
    }

    if (req.body.tags && !Array.isArray(req.body.tags)) {
      req.body.tags = [];
    }

    if (req.body.files && !Array.isArray(req.body.files)) {
      req.body.files = generateFileIds(req.body.files, req.body.name);
    }

    const template = await Template.create(req.body);

    res.status(201).json({
      success: true,
      data: template,
    });
  }
);

export const deleteTemplate = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return next(
        new ErrorResponse(`Template not found with id of ${req.params.id}`, 404)
      );
    }

    if (req.user?.role !== "admin") {
      return next(
        new ErrorResponse(
          `User ${req.user?._id} is not authorized to delete this template`,
          403
        )
      );
    }

    await Template.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

export const incrementDownloads = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { downloads: 1 },
      },
      { new: true }
    );

    if (!template) {
      return next(
        new ErrorResponse(`Template not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  }
);

const generateFileIds = (files: any[], templateName: string): any[] => {
  const templateSlug = templateName.toLowerCase().replace(/\s+/g, "-");

  const processFile = (file: any, index: number) => {
    const processedFile = { ...file };

    if (!processedFile.id) {
      if (processedFile.type === "folder") {
        processedFile.id = `${templateSlug}-${processedFile.name}-${index}`;
      } else {
        processedFile.id = `${templateSlug}-${processedFile.name.replace(/\./g, "-")}-${index}`;
      }
    }

    if (processedFile.children && Array.isArray(processedFile.children)) {
      processedFile.children = processedFile.children.map(
        (child: any, childIndex: number) => {
          const processedChild = processFile(child, childIndex);

          if (!processedChild.parentId) {
            processedChild.parentId = processedFile.id;
          }
          return processedChild;
        }
      );
    }

    return processedFile;
  };

  return files.map((file, index) => processFile(file, index));
};
