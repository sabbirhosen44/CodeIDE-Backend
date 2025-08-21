import mongoose, { Schema } from "mongoose";
import type { ITemplate } from "../types/index.js";
import { FRAMEWORKS } from "../constants/frameworks.js";
import { LANGUAGES } from "../constants/languages.js";
import { PROJECT_TYPES } from "../constants/projectTypes.js";

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
    required: true,
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
    enum: PROJECT_TYPES,
    required: true,
  },
  language: {
    type: String,
    enum: LANGUAGES,
    required: true,
    default: "JavaScript",
  },
  framework: {
    type: String,
    enum: FRAMEWORKS,
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
