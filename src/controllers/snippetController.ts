import { NextFunction, Response } from "express";
import { Types } from "mongoose";
import SnippetComment from "../models/SnippetCommentSchema.js";
import Snippet from "../models/SnippetSchema.js";
import { RequestWithUser } from "../types/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";
import SnippetLike from "../models/SnippetLikeSchema.js";

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
      .populate("owner", "email name avater")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Snippet.countDocuments(query);

    // comment counts for each snippet
    const snippetIds = snippets.map((snippet) => snippet._id);
    const commentCounts = await SnippetComment.aggregate([
      { $match: { $in: { snippetIds } } },
      { $group: { _id: "$snippet", totalComment: { $sum: 1 } } },
    ]);

    const commentCountMap = new Map();
    commentCounts.forEach((item) =>
      commentCountMap.set(item._id.toString(), item.totalComment)
    );

    const snippetsWithCounts = snippets.map((snippet) => ({
      ...snippet,
      comments: [],
      commentCount:
        commentCountMap.get((snippet._id as Types.ObjectId).toString()) || 0,
    }));

    res.status(200).json({
      success: true,
      count: snippetsWithCounts.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: snippetsWithCounts,
    });
  }
);

export const getSnippet = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { id: snippetId } = req.params;

    const snippet = await Snippet.findById(snippetId)
      .populate("owner", "name email avater")
      .lean();

    if (!snippet) {
      return next(
        new ErrorResponse(`Snippet not found with ID ${snippetId}`, 404)
      );
    }

    const comments = await SnippetComment.findById(snippetId)
      .populate("owner", "name email avater")
      .sort({ createdAt: -1 })
      .lean();

    // check user has liked this snippet
    let isLiked = false;
    if (req.user) {
      const existingLike = await SnippetLike.findOne({
        snippet: snippetId,
        user: req.user._id,
      }).lean();
      isLiked = !!isLiked;
    }

    // increment view count
    await Snippet.findByIdAndUpdate(
      snippetId,
      { $inc: { viewCount: 1 } },
      { new: false }
    );

    const responseData = {
      ...snippet,
      comments,
      isLiked,
      viewCount: (snippet.viewCount || 0) + 1,
    };

    res.status(200).json({ success: "success", data: responseData });
  }
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
