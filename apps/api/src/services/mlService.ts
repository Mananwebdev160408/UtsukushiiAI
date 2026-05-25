import path from "path";
import { config } from "../config";
import { AppError } from "../errors";

type MusicSuggestionRequest = {
  mangaPath: string;
};

export class MLService {
  private resolveWorkerInputPath(filePath: string): string {
    if (!filePath) {
      throw new AppError("Missing file path for ML worker request", 422, "MISSING_ML_INPUT");
    }

    if (filePath.startsWith("/uploads/")) {
      const relativePath = filePath.replace(/^\/uploads\//, "");
      return path.join(config.storage.path, relativePath);
    }

    return filePath;
  }

  async suggestMusic(request: MusicSuggestionRequest) {
    if (!request.mangaPath) {
      throw new AppError("mangaPath is required", 400, "MISSING_MANGA_PATH");
    }

    const response = await fetch(`${config.mlWorker.url}/suggest/music`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ manga_path: this.resolveWorkerInputPath(request.mangaPath) }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AppError(
        `ML worker rejected music suggestion request: ${errorText || response.statusText}`,
        502,
        "ML_WORKER_REQUEST_FAILED",
      );
    }

    return response.json();
  }
}

export const mlService = new MLService();