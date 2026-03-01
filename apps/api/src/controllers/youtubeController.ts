import { Request, Response, NextFunction } from "express";
import { youtubeService } from "../services";

export const downloadAudio = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await youtubeService.downloadAudio(
      req.body.url,
      req.body.projectId,
    );
    res.status(202).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};
