import fs from "fs";
import { logger } from "@utsukushii/api/src/utils/logger";

export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

export const deleteDirectory = async (dirPath: string): Promise<boolean> => {
  try {
    if (fs.existsSync(dirPath)) {
      // requires node 14+
      await fs.promises.rm(dirPath, { recursive: true, force: true });
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`Error deleting directory ${dirPath}:`, error);
    return false;
  }
};
