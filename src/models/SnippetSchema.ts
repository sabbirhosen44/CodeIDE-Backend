import mongoose, { Schema } from "mongoose";
import type { ISnippet } from "../types/index.js";

export const SnippetSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, "Please add a snippet title"],
    trim: true,
    maxlength: [100, "Snippet title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    maxlength: [500, "Description cannot be more than 500 characters"],
  },
  code: {
    type: String,
    required: [true, "Please add snippet code"],
  },
  language: {
    type: String,
    enum: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "C",
      "C++",
      "C#",
      "PHP",
      "Ruby",
      "Go",
      "Rust",
      "Swift",
      "Kotlin",
    ],
    default: "JavaScript",
  },
  tags: [String],
  owner: {
    type: mongoose.Schema.Types.Mixed,
    ref: "User",
    required: true,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for better query performance
SnippetSchema.index({ owner: 1, createdAt: -1 });
SnippetSchema.index({ language: 1 });
SnippetSchema.index({ tags: 1 });

SnippetSchema.pre<ISnippet>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ISnippet>("Snippet", SnippetSchema);
