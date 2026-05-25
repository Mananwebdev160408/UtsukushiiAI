import { NextFunction, Request, Response } from "express";
import { mlService } from "../services";

export const suggestMusic = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const suggestion = await mlService.suggestMusic({
      mangaPath: req.body.mangaPath,
    });

    res.status(200).json({ status: "success", data: suggestion });
  } catch (error) {
    next(error);
  }
};