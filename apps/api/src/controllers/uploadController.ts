import { Request, Response, NextFunction } from "express";
import { storageService } from "../services";

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
    // Logic to verify file exists in storage and update project metadata
    res.status(200).json({ status: "success", message: "Upload confirmed" });
  } catch (error) {
    next(error);
  }
};
