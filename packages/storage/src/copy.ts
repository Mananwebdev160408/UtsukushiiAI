import fs from "fs";
import path from "path";
import { logger } from "@utsukushii/api/src/utils/logger";

export const copyFile = async (
  sourcePath: string,
  targetDir: string,
  newFileName?: string,
): Promise<string | null> => {
  try {
    if (!fs.existsSync(sourcePath)) {
      logger.warn(`Source file not found: ${sourcePath}`);
      return null;
    }

    if (!fs.existsSync(targetDir)) {
      await fs.promises.mkdir(targetDir, { recursive: true });
    }

    const fileName = newFileName || path.basename(sourcePath);
    const targetPath = path.join(targetDir, fileName);

    await fs.promises.copyFile(sourcePath, targetPath);
    return targetPath;
  } catch (error) {
    logger.error(
      `Error copying file from ${sourcePath} to ${targetDir}:`,
      error,
    );
    return null;
  }
};

export const moveFile = async (
  sourcePath: string,
  targetDir: string,
  newFileName?: string,
): Promise<string | null> => {
  try {
    if (!fs.existsSync(sourcePath)) {
      logger.warn(`Source file not found: ${sourcePath}`);
      return null;
    }

    if (!fs.existsSync(targetDir)) {
      await fs.promises.mkdir(targetDir, { recursive: true });
    }

    const fileName = newFileName || path.basename(sourcePath);
    const targetPath = path.join(targetDir, fileName);

    await fs.promises.rename(sourcePath, targetPath);
    return targetPath;
  } catch (error) {
    logger.error(
      `Error moving file from ${sourcePath} to ${targetDir}:`,
      error,
    );
    return null;
  }
};
