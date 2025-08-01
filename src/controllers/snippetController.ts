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
    try {
      req.body.owner = req.user?._id;

      const snippet = await Snippet.create(req.body);

      res.status(201).json({
        success: true,
        data: snippet,
      });
    } catch (error: any) {
      return next(new ErrorResponse("Error creating Snippet", 500));
    }
  }
);

export const getSnippets = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {}
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
