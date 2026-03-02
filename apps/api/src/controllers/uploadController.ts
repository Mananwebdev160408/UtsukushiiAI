import { Request, Response, NextFunction } from "express";
import { storageService, projectService } from "../services";

export const getDirectUploadUrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { folder, filename } = req.body;
    const result = await storageService.getDirectUploadUrl(folder, filename);
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const confirmUpload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.id;
    const {
      projectId,
      fileUrl,
      type,
      chapterNumber,
      chapterTitle,
      mimeType,
      size,
    } = req.body;

    if (type === "manga") {
      const chapter = {
        id: `chap_${Date.now()}`,
        chapterNumber: chapterNumber || 1,
        title: chapterTitle || `Chapter ${chapterNumber || 1}`,
        fileUrl,
        originalName: fileUrl.split("/").pop() || "unknown",
        mimeType: mimeType || "application/pdf",
        size: size || 0,
      };

      await projectService.updateProject(userId, projectId, {
        $push: { mangaChapters: chapter },
        status: "processing", // Auto-trigger processing on new chapter
      });
    } else if (type === "audio") {
      await projectService.updateProject(userId, projectId, {
        audioInfo: {
          fileUrl,
          originalName: fileUrl.split("/").pop() || "unknown",
        },
      });
    }

    res.status(200).json({ status: "success", message: "Upload confirmed" });
  } catch (error) {
    next(error);
  }
};
