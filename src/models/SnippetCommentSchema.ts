import mongoose, { Schema } from "mongoose";
import { ISnippetComment } from "../types/index.js";

const snippetCommentSchema: Schema = new Schema({
  snippet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Snippet",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: [true, "Please add a comment"],
    maxlength: [1000, "Comment can't be more that 1000 characters!"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ISnippetComment>(
  "SnippetComment",
  snippetCommentSchema
);
