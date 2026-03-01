export interface RenderJob {
  id: string;
  userId: string;
  projectId: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  outputUrl?: string;
  error?: {
    code: string;
    message: string;
  };
  settings: {
    format: string;
    quality: string;
    resolution: string;
    fps: number;
  };
  duration?: number;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}
