import { Router } from "express";
import type { AuthController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema } from "../validators/auth.schema.js";
import type { ITokenService } from "../../../application/ports/ITokenService.js";
import { authenticate } from "../middlewares/authenticate.js";

export const createAuthRouter = (controller: AuthController, 
  tokenService: ITokenService): Router => {
  const router = Router();

  router.post("/login", validate(loginSchema), controller.login);
  router.post("/logout", controller.logout);
  router.get("/me", authenticate(tokenService), controller.me);
  return router;
};
