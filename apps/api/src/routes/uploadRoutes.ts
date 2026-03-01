import { Router } from "express";
import { uploadController } from "../controllers";
import { validate, auth } from "../middleware";
import { directUploadSchema, confirmUploadSchema } from "../utils/validators";

const router = Router();

router.use(auth);

router.post(
  "/direct",
  validate(directUploadSchema),
  uploadController.getDirectUploadUrl,
);
router.post(
  "/complete",
  validate(confirmUploadSchema),
  uploadController.confirmUpload,
);

export default router;
