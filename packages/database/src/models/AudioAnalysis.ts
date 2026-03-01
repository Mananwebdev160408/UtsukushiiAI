import mongoose, { Schema, Document } from "mongoose";

export interface IAudioAnalysis extends Document {
  projectId: string;
  userId: string;
  bpm: number;
  duration: number;
  beats: Array<{
    id: string;
    time: number;
    confidence: number;
  }>;
  onsets: number[];
  segments: Array<{
    start: number;
    duration: number;
    confidence: number;
  }>;
}

const AudioAnalysisSchema = new Schema<IAudioAnalysis>(
  {
    projectId: { type: String, required: true, ref: "Project", unique: true },
    userId: { type: String, required: true, ref: "User" },
    bpm: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    beats: [
      {
        id: String,
        time: Number,
        confidence: Number,
      },
    ],
    onsets: [Number],
    segments: [
      {
        start: Number,
        duration: Number,
        confidence: Number,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const AudioAnalysis = mongoose.model<IAudioAnalysis>(
  "AudioAnalysis",
  AudioAnalysisSchema,
);
