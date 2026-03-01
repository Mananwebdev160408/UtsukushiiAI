import { Router } from "express";
import { renderController } from "../controllers";
import { validate, auth } from "../middleware";
import { startRenderSchema } from "../utils/validators";

const router = Router();

router.use(auth);

router.get("/", renderController.listJobs);
router.post(
  "/start",
  validate(startRenderSchema),
  renderController.startRender,
);
router.get("/:jobId", renderController.getStatus);
router.delete("/:jobId", renderController.cancel);

export default router;
