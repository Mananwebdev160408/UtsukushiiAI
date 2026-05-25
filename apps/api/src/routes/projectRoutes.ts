import { Router } from "express";
import { projectController } from "../controllers";
import { validate, auth } from "../middleware";
import { createProjectSchema, updateProjectSchema, detectOptionsSchema } from "../utils/validators";

const router = Router();

router.use(auth);

router.get("/", projectController.list);
router.post("/", validate(createProjectSchema), projectController.create);
router.get("/:id", projectController.getById);
router.put("/:id", validate(updateProjectSchema), projectController.update);
router.delete("/:id", projectController.remove);
router.post("/:id/detect", validate(detectOptionsSchema), projectController.detect);

export default router;
