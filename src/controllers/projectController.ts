import { NextFunction, Response } from "express";
import Project from "../models/ProjectSchema.js";
import Template from "../models/TemplateSchema.js";
import { RequestWithUser } from "../types/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";

const copyFilesWithNewIds = (files: any[]): any[] => {
  return files.map((file) => {
    const newFile = {
      ...file,
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    if (file.children && file.children.length > 0) {
      newFile.children = copyFilesWithNewIds(file.children);
      newFile.children.forEach((child: any) => {
        child.parentId = newFile.id;
      });
    }

    return newFile;
  });
};

export const getUserProjects = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { search, sort = "-lastModified", page = 1, limit = 10 } = req.query;

    const query: any = { owner: req.user?._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        {
          description: { $regex: search, $options: "i" },
        },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const projects = await Project.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(Number(limit));

    const total = await Project.countDocuments(query);

    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: projects,
    });
  }
);

export const getUserProject = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const project = await Project.findById(req.params.id)
        .populate("templateId", "name language framework")
        .populate("owner", "name email");

      if (!project) {
        return next(
          new ErrorResponse(
            `Project not found with id of ${req.params.id}`,
            404
          )
        );
      }

      const isOwner = project.owner.toString() === req.user?._id;
      const isAdmin = req.user?.role === "admin";

      if (isOwner && !isAdmin) {
        return next(
          new ErrorResponse("Not authorized to access this project", 403)
        );
      }

      res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error: any) {
      return next(new ErrorResponse("Error fetching project", 500));
    }
  }
);

export const createProjectFromTemplate = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { templateId, name, description } = req.body;

      if (!templateId || !name) {
        return next(
          new ErrorResponse("Template ID and project name are required", 400)
        );
      }

      if (!req.user?._id) {
        return next(new ErrorResponse("User not authenticated", 401));
      }

      const template = await Template.findById(templateId);

      if (!template) {
        return next(new ErrorResponse("Template not found", 404));
      }

      const copiedFiles = copyFilesWithNewIds(template.files);

      const projectData = {
        name: name.trim(),
        description: description?.trim() || `Project based on ${template.name}`,
        templateId,
        files: copiedFiles,
        owner: req.user?._id,
      };

      const project = await Project.create(projectData);

      await project.populate("templateId", "name  language framework");

      res.status(201).json({
        success: true,
        data: project,
      });
    } catch (error: any) {
      return next(new ErrorResponse("Failed to create project", 500));
    }
  }
);

export const updateProject = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return next(
        new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
      );
    }

    if (project.owner.toString() !== req.user?._id.toString()) {
      return next(
        new ErrorResponse("Not authorized to update this project", 403)
      );
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("templateId", "name language framework");

    res.status(200).json({
      success: true,
      data: project,
    });
  }
);

export const deleteProject = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(
        new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
      );
    }

    if (
      project.owner.toString() !== req.user?._id ||
      req.user?.role !== "admin"
    ) {
      return next(
        new ErrorResponse("Not authorized to delete this project", 403)
      );
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);
