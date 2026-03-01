import { Router } from "express";
import { authController } from "../controllers";
import { validate, auth } from "../middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../utils/validators";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshTokenSchema), authController.refresh);
router.post("/logout", auth, authController.logout);
router.get("/me", auth, authController.getMe);

export default router;
