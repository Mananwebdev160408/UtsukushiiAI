import fs from "fs/promises";
import path from "path";
import { config } from "../config";
import { logger } from "../utils/logger";

export class StorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = config.storage.path;
    this.initStorage();
  }

  private async initStorage() {
    const dirs = ["manga", "audio", "images", "exports"];
    for (const dir of dirs) {
      await fs.mkdir(path.join(this.baseDir, dir), { recursive: true });
    }
    logger.info(`Storage initialized at ${this.baseDir}`);
  }

  async getDirectUploadUrl(folder: string, filename: string) {
    // For local storage, we just return the relative path
    // In production (S3), we would return a pre-signed URL
    const relativePath = path.join(folder, `${Date.now()}_${filename}`);
    return {
      uploadUrl: `http://localhost:${config.port}/v1/upload/stream`, // dummy
      fileUrl: `/uploads/${relativePath.replace(/\\/g, "/")}`,
      key: relativePath,
    };
  }

  async saveFile(
    folder: string,
    filename: string,
    buffer: Buffer,
  ): Promise<string> {
    const relativePath = path.join(folder, `${Date.now()}_${filename}`);
    const fullPath = path.join(this.baseDir, relativePath);
    await fs.writeFile(fullPath, buffer);
    return `/uploads/${relativePath.replace(/\\/g, "/")}`;
  }

  async getStream(fileUrl: string) {
    const relativePath = fileUrl.replace("/uploads/", "");
    const fullPath = path.join(this.baseDir, relativePath);
    return fs.readFile(fullPath);
  }

  async deleteFile(fileUrl: string) {
    if (!fileUrl.startsWith("/uploads/")) return;
    const relativePath = fileUrl.replace("/uploads/", "");
    const fullPath = path.join(this.baseDir, relativePath);
    try {
      await fs.access(fullPath);
      await fs.unlink(fullPath);
    } catch (error) {
      // File might not exist, that's fine for delete
    }
  }
}

export const storageService = new StorageService();
