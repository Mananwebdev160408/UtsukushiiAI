import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  userId: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: String, required: true, ref: "User" },
    refreshToken: { type: String, required: true, unique: true },
    userAgent: String,
    ipAddress: String,
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model<ISession>("Session", SessionSchema);
