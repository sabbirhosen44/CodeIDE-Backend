import { NextFunction, Response } from "express";
import { Types } from "mongoose";
import { LANGUAGES_MAP } from "../constants/languages.js";
import SnippetComment from "../models/SnippetCommentSchema.js";
import SnippetLike from "../models/SnippetLikeSchema.js";
import Snippet from "../models/SnippetSchema.js";
import { RequestWithUser } from "../types/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";

export const createSnippet = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    req.body.owner = req.user?._id;
    console.log(req.body);

    const inputLanguage = req.body.language?.toLowerCase();
    if (LANGUAGES_MAP[inputLanguage]) {
      req.body.language = LANGUAGES_MAP[inputLanguage];
    }

    const snippet = await Snippet.create(req.body);
    console.log(snippet);

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

    console.log("Query:", query);

    const total = await Snippet.countDocuments(query);

    const skip = (Number(page) - 1) * Number(limit);

    const snippets = await Snippet.find(query)
      .populate("owner", "email name avaterUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // comment counts for each snippet
    const snippetIds = snippets.map((snippet) => snippet._id);

    console.log(snippetIds);

    // console.log(snippetIds);
    const commentCounts = await SnippetComment.aggregate([
      { $match: { snippet: { $in: snippetIds } } },
      { $group: { _id: "$snippet", totalComment: { $sum: 1 } } },
    ]);

    console.log(commentCounts);

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

    console.log(snippetsWithCounts);

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
      isLiked = !!existingLike;
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
  ): Promise<void> => {
    const { id: snippetId } = req.params;

    if (!snippetId) return next(new ErrorResponse("Snippet not found!", 404));

    const existingLike = await SnippetLike.findOne({
      snippet: req.params.id,
      user: req.user?._id,
    });

    let isLiked = false;
    let message = "";
    if (existingLike) {
      await SnippetLike.deleteOne({ _id: existingLike._id });
      await Snippet.findByIdAndUpdate(snippetId, { $inc: { likeCount: -1 } });
      isLiked = false;
      message = "Snippet unliked successfully!";
    } else {
      await SnippetLike.create({ snippet: snippetId, user: req.user?._id });
      await Snippet.findByIdAndUpdate(snippetId, { $inc: { likeCount: +1 } });
      isLiked = true;
      message = "Snippet liked successfully!";
    }

    const updatedSnippet =
      await Snippet.findById(snippetId).select("likeCount");
    const likeCount = updatedSnippet?.likeCount || 0;

    res.status(200).json({
      success: true,
      message,
      data: {
        isLiked,
        likeCount,
      },
    });
  }
);

export const updateSnippet = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { id: snippetId } = req.params;

    let snippet = await Snippet.findById(snippetId);

    if (!snippet) {
      return next(
        new ErrorResponse(`Snippet not found with id of ${req.params.id}`, 404)
      );
    }

    if (snippet.owner.toString() !== req.user?.id.toString()) {
      return next(
        new ErrorResponse("User not authorized to update snippet", 403)
      );
    }

    snippet = await Snippet.findByIdAndUpdate(snippetId, req.body, {
      new: true,
      runValidators: true,
    }).populate("owner", "name email avater");

    res.status(200).json({ success: true, data: snippet });
  }
);

export const deleteSnippet = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { id: snippetId } = req.params;

    let snippet = await Snippet.findById(snippetId);

    if (!snippet) {
      return next(
        new ErrorResponse(`Snippet not found with id of ${snippetId}`, 404)
      );
    }

    if (snippet.owner.toString() !== req.user?.id.toString()) {
      return next(
        new ErrorResponse("User not authorized to update snippet", 403)
      );
    }

    // Delete all the comments and likes associated with the snippet
    await SnippetComment.deleteMany({
      snippet: snippetId,
    });
    await SnippetLike.deleteMany({
      snippet: snippetId,
    });

    // Delete the snippet
    await snippet.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: "Snippet deleted successfully!",
    });
  }
);

export const getUserSnippets = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user?._id) {
      return next(new ErrorResponse("User not authenticated!", 401));
    }

    const snippets = await Snippet.find({ owner: req.user?._id })
      .populate("owner", "name email avater")
      .sort({ createdAt: -1 })
      .lean();

    const snippetIds = snippets.map((snippet) => snippet._id);

    let commentCounts = [];
    if (snippetIds.length > 0) {
      commentCounts = await SnippetComment.aggregate([
        { $match: { $in: { snippetIds } } },
        { $group: { _id: "$snippet", count: { $sum: 1 } } },
      ]);
    }

    const commentCountMap = new Map();
    commentCounts.forEach((item) =>
      commentCountMap.set(item._id.toString(), item.count)
    );

    const snippetsWithCounts = snippets.map((snippet) => ({
      ...snippet,
      _id: snippet._id,
      title: snippet.title,
      description: snippet.description || "",
      code: snippet.code || "",
      language: snippet.language,
      owner: snippet.owner,
      viewCount: snippet.viewCount,
      likeCount: snippet.likeCount,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
      comments: [],
      commentCount: commentCountMap.get(snippet._id.toString()) || 0,
    }));

    res.status(200).json({
      success: true,
      totalSnippets: snippetsWithCounts.length,
      data: snippetsWithCounts,
    });
  }
);

export const addComment = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { id: snippetId } = req.params;

    if (!req.user?._id) {
      return next(new ErrorResponse("User not authenticated!", 401));
    }

    const snippet = await Snippet.findById(snippetId);

    if (!snippet) {
      return next(
        new ErrorResponse(`Snippet not found with id of ${req.params.id}`, 404)
      );
    }

    const comment = await SnippetComment.create({
      snippet: snippetId,
      user: req.user?.id,
      content: req.body.content,
    });

    await comment.populate("user", "name email avatar");

    res.status(201).json({
      success: true,
      data: comment,
    });
  }
);

export const deleteComment = asyncHandler(
  async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { id: snippetId } = req.params;

    if (!req.user?._id) {
      return next(new ErrorResponse("User not authenticated!", 401));
    }

    const comment = await SnippetComment.findById(snippetId);

    if (!comment) {
      return next(
        new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
      );
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);
