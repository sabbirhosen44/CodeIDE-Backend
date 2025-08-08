import { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { RequestWithUser } from "../types/index.js";
import Snippet from "../models/SnippetSchema.js";
import ErrorResponse from "../utils/errorResponse.js";

export const createSnippet = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    req.body.owner = req.user?._id;

    const snippet = await Snippet.create(req.body);

    if (!snippet)
      return next(new ErrorResponse("Failed to create snippet", 500));

    res.status(201).json({
      success: true,
      data: snippet,
    });
  }
);

export const getSnippets = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { language, tags, search, page = 1, limit = 10 } = req.query;
    let query: any = {};

    if (language) query.language = language;
    if (tags) query.tags = { $in: (tags as string).split(",") };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const snippets = await Snippet.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Snippet.countDocuments(query);

    res.status(200).json({
      success: true,
      count: snippets.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: snippets,
    });
  }
);

export const getSnippet = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {}
);

export const toggleLikeSnippet = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {}
);

export const updateSnippet = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {}
);

export const deleteSnippet = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {}
);

export const getUserSnippets = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {}
);

export const addComment = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {}
);

export const deleteComment = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {}
);
