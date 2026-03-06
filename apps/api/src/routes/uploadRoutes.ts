import { Router } from "express";
import { uploadController } from "../controllers";
import { validate, auth } from "../middleware";
import { checkFileSize } from "../middleware/fileSize";
import { directUploadSchema, confirmUploadSchema } from "../utils/validators";

const router = Router();

router.use(auth);

router.post(
  "/direct",
  validate(directUploadSchema),
  checkFileSize,
  uploadController.getDirectUploadUrl,
);
router.post(
  "/complete",
  validate(confirmUploadSchema),
  checkFileSize,
  uploadController.confirmUpload,
);

export default router;
