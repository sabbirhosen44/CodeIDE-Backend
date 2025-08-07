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
    const {} = req.query;
    let query: any = {};
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
