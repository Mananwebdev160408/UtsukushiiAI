import { Router } from "express";
import { youtubeController } from "../controllers";
import { validate, auth } from "../middleware";
import { youtubeDownloadSchema } from "../utils/validators";

const router = Router();

router.use(auth);

router.post(
  "/download",
  validate(youtubeDownloadSchema),
  youtubeController.downloadAudio,
);

export default router;
