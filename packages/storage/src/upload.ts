import fs from "fs";
import path from "path";
import multer from "multer";
import { generateId } from "@utsukushii/api/src/utils/idGenerator";

export const uploadOptions = {
  // Configured up to 100MB for manga
  limits: { fileSize: 100 * 1024 * 1024 },
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      // In temp folder by default until processed or moved
      const tempPath = path.join(process.cwd(), "uploads", "temp");
      fs.mkdirSync(tempPath, { recursive: true });
      cb(null, tempPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${generateId("tmp")}${ext}`);
    },
  }),
};

// Return a multer instance configured for single or multiple files
export const uploader = multer(uploadOptions);

export const uploadSingle = (fieldName: string) => {
  return uploader.single(fieldName);
};

export const uploadMultiple = (fieldName: string, maxCount: number = 100) => {
  return uploader.array(fieldName, maxCount);
};
