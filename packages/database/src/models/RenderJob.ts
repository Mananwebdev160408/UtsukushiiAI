import mongoose, { Schema, Document } from "mongoose";
import { RenderJob as RenderJobType } from "../../../shared/src/types/render";

export interface IRenderJob
  extends
    Document,
    Omit<
      RenderJobType,
      "id" | "userId" | "projectId" | "createdAt" | "updatedAt"
    > {
  _id: any;
  userId: string;
  projectId: string;
}

const RenderJobSchema = new Schema<IRenderJob>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, ref: "User" },
    projectId: { type: String, required: true, ref: "Project" },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
    },
    progress: { type: Number, default: 0 },
    outputUrl: { type: String },
    error: {
      code: String,
      message: String,
    },
    settings: {
      format: { type: String, default: "mp4" },
      quality: { type: String, default: "high" },
      resolution: { type: String, default: "1080x1920" },
      fps: { type: Number, default: 30 },
    },
    duration: Number,
    fileSize: Number,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const RenderJob = mongoose.model<IRenderJob>(
  "RenderJob",
  RenderJobSchema,
);
