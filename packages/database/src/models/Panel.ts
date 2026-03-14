import mongoose, { Schema, Document } from "mongoose";
import { Panel as PanelType } from "../../../shared/src/types/panel";

export interface IPanel
  extends
    Document,
    Omit<PanelType, "id" | "projectId" | "createdAt" | "updatedAt"> {
  _id: any;
  projectId: string;
}

const PanelSchema = new Schema<IPanel>(
  {
    _id: { type: String, required: true },
    projectId: { type: String, required: true, ref: "Project" },
    pageIndex: { type: Number, required: true },
    order: { type: Number, required: true },
    bbox: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    maskUrl: { type: String },
    effects: {
      parallax: { type: Number, default: 0 },
      glow: { type: Boolean, default: false },
      glitch: { type: Boolean, default: false },
      blur: { type: Number, default: 0 },
    },
    transitions: [
      {
        type: { type: String, default: "none" },
        duration: { type: Number, default: 0.5 },
        beatId: { type: String },
        easing: { type: String, default: "ease-in-out" },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Panel = mongoose.model<IPanel>("Panel", PanelSchema);
