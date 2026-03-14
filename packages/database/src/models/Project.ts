import mongoose, { Schema, Document } from "mongoose";
import { Project as ProjectType } from "../../../shared/src/types/project";

export interface IProject
  extends
    Document,
    Omit<ProjectType, "id" | "userId" | "createdAt" | "updatedAt"> {
  _id: any;
  userId: string;
}

const ProjectSchema = new Schema<IProject>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, ref: "User" },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["draft", "processing", "ready", "error"],
      default: "draft",
    },
    aspectRatio: {
      type: String,
      enum: ["9:16", "16:9", "1:1"],
      default: "9:16",
    },
    mangaChapters: [
      {
        id: String,
        chapterNumber: Number,
        title: String,
        fileUrl: String,
        originalName: String,
        mimeType: String,
        size: Number,
        width: Number,
        height: Number,
        pageCount: Number,
      },
    ],
    audioInfo: {
      fileUrl: String,
      originalName: String,
      duration: Number,
      bpm: Number,
    },
    settings: {
      resolution: { type: String, default: "1080x1920" },
      fps: { type: Number, default: 30 },
      quality: { type: String, default: "high" },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
