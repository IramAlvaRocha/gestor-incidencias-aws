import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { registrarUsuarioSchema } from '../validators/user.schema.js';
import type { UserController } from '../controllers/user.controller.js';
import type { ITokenService } from '../../../application/ports/ITokenService.js';
import { autenticate } from '../middlewares/authenticate.js';
import { autorize } from '../middlewares/authorize.js';

export const crearUserRouter = (controller: UserController, tokenService: ITokenService): Router => {
  const router = Router();

  router.post('/', validate(registrarUsuarioSchema), controller.registrar);
  router.get('/', autenticate(tokenService), autorize('Admin'),controller.listar);

  return router;
};