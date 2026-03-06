import { logger } from "../utils/logger";
import { generateId } from "../utils/idGenerator";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { config } from "../config";

const execAsync = promisify(exec);

export class YouTubeService {
  async downloadAudio(url: string, projectId: string) {
    logger.info(
      `YouTube download initiated for URL: ${url} (Project: ${projectId})`,
    );

    // In a real app, this would use yt-dlp to download and convert to MP3
    // and then call projectService.updateProject with the fileUrl

    const taskId = generateId("yt");

    // We don't await this so it processes in the background
    this.processDownload(taskId, projectId, url).catch((err) => {
      logger.error(
        `Unhandled error during background download for ${taskId}:`,
        err,
      );
    });

    return {
      taskId,
      status: "pending",
      message: "YouTube download queued in Docker",
    };
  }

  private async processDownload(
    taskId: string,
    projectId: string,
    url: string,
  ) {
    try {
      logger.info(`Starting YouTube download for ${url}`);

      const audioDir = path.join(config.storage.path, "audio");

      // Ensure the directory exists
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      const outputPath = path.join(audioDir, `${taskId}.mp3`);

      logger.info(`Executing yt-dlp to download to ${outputPath}`);
      // Execute yt-dlp command. -x extracts audio, --audio-format mp3 converts it
      await execAsync(
        `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`,
      );

      logger.info(
        `YouTube download task ${taskId} completed for project ${projectId}. File saved at ${outputPath}`,
      );

      // TODO: Emit socket.io event to the frontend that it has completed
      // import { emitToUser } from "./websocketService";
      // emitToUser(userId, "render:complete", { url: `/uploads/audio/${taskId}.mp3` });
    } catch (err) {
      logger.error(`Failed to download audio task ${taskId}: `, err);
    }
  }
}

export const youtubeService = new YouTubeService();
