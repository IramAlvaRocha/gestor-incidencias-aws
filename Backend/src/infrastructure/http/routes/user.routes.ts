import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { registerUserSchema } from '../validators/user.schema.js';
import type { UserController } from '../controllers/user.controller.js';
import type { ITokenService } from '../../../application/ports/ITokenService.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

export const createUserRouter = (controller: UserController, tokenService: ITokenService): Router => {
  const router = Router();

  router.post('/', validate(registerUserSchema), controller.register);
  router.get('/', authenticate(tokenService), authorize('Admin'),controller.getAll);

  return router;
};