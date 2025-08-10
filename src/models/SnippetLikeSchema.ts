import mongoose, { Schema } from "mongoose";
import { ISnippetLike } from "../types/index.js";

const SnippetLikeSchema: Schema = new Schema({
  snippet: {
    type: mongoose.Schema.ObjectId,
    ref: "Snippet",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

SnippetLikeSchema.index({ snippet: 1, user: 1 }, { unique: true });

export default mongoose.model<ISnippetLike>("SnippetLike", SnippetLikeSchema);
