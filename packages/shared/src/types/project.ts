export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: "draft" | "processing" | "ready" | "error";
  aspectRatio: "9:16" | "16:9" | "1:1";
  mangaPage?: {
    fileUrl: string;
    originalName: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    pageCount?: number;
  };
  audioInfo?: {
    fileUrl: string;
    originalName: string;
    duration?: number;
    bpm?: number;
  };
  settings: {
    resolution: string;
    fps: number;
    quality: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreate {
  title: string;
  description?: string;
  aspectRatio?: string;
}

export interface ProjectUpdate {
  title?: string;
  description?: string;
  settings?: {
    resolution?: string;
    fps?: number;
    quality?: string;
  };
}
