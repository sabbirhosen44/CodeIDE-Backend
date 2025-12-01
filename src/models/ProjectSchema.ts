import mongoose, { mongo, Schema } from "mongoose";
import { IProject } from "../types/index.js";

const ProjectFileSchema: Schema = new Schema({
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
  children: [{ type: Schema.Types.Mixed }],
});

const ProjectSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
    required: true,
  },
  files: [ProjectFileSchema],
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ProjectSchema.pre<IProject>("save", function (next) {
  this.lastModified = new Date();
  next();
});

ProjectSchema.pre<IProject>("findOneAndUpdate", function (next) {
  this.set({ lastModified: new Date() });
  next();
});

ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ template: 1 });
ProjectSchema.index({ createdAt: -1 });

export default mongoose.model<IProject>("Project", ProjectSchema);
