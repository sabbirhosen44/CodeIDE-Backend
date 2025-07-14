import mongoose, { Schema } from "mongoose";
import type { ITemplate } from "../types/index.js";

const TemplateFileSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["file", "folder"],
    required: true,
  },
  parentId: {
    type: String,
  },
  content: {
    type: String,
  },
  isExpanded: {
    type: Boolean,
  },
  children: {
    type: Schema.Types.Mixed,
  },
});

const TemplateSchema: Schema = new Schema({
  name: {
    type: String,
    require: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
  },
  category: {
    type: String,
    enum: [
      "Frontend",
      "Backend",
      "Full Stack",
      "Mobile",
      "Desktop",
      "Standalone",
      "Library",
      "Framework",
    ],
    required: true,
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
      "Other",
    ],
    required: true,
    default: "JavaScript",
  },
  framework: {
    type: String,
    enum: [
      "React",
      "Next.js",
      "Vue",
      "Angular",
      "Express",
      "Django",
      "Spring",
      "Laravel",
      null,
    ],
    default: null,
  },
  tags: [{ type: String, lowercase: true, trim: true }],
  files: [TemplateFileSchema],
  downloads: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

TemplateSchema.pre<ITemplate>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

TemplateSchema.index({ language: 1, category: 1 });
TemplateSchema.index({ tags: 1 });
TemplateSchema.index({ createdAt: -1 });

export default mongoose.model<ITemplate>("Template", TemplateSchema);
