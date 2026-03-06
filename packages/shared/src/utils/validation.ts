import { z } from "zod";

// Shared Validation Schemas
export const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const ProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["manga", "audio", "video"]),
});

export const PanelSchema = z.object({
  projectId: z.string(),
  bbox: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  order: z.number(),
});
