import { Router } from "express";
import { panelController } from "../controllers";
import { validate, auth } from "../middleware";
import { createPanelSchema, updatePanelSchema } from "../utils/validators";

const router = Router();

router.use(auth);

router.get("/:projectId/panels", panelController.list);
router.post(
  "/:projectId/panels",
  validate(createPanelSchema),
  panelController.create,
);
router.put(
  "/:projectId/panels/:panelId",
  validate(updatePanelSchema),
  panelController.update,
);
router.delete("/:projectId/panels/:panelId", panelController.remove);
router.post("/:projectId/reorder", panelController.reorder);

export default router;
