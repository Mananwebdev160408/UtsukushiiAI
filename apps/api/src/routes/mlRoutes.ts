import { Router } from "express";
import { z } from "zod";
import { mlController } from "../controllers";
import { auth, validate } from "../middleware";

const router = Router();

const suggestMusicSchema = z.object({
  mangaPath: z.string().min(1),
});

router.use(auth);

router.post(
  "/suggest/music",
  validate(suggestMusicSchema),
  mlController.suggestMusic,
);

export default router;