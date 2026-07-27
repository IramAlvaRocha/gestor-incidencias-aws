import { Router } from "express";
import type { AuthController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema } from "../validators/auth.schema.js";

export const createAuthRouter = (controller: AuthController): Router => {
  const router = Router();

  router.post("/login", validate(loginSchema), controller.login);

  return router;
};
