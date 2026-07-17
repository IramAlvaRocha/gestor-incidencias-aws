import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { registrarUsuarioSchema } from '../validators/user.schema.js';

export const crearUserRouter = (controller: UserController): Router => {
  const router = Router();

  router.post('/', validate(registrarUsuarioSchema), controller.registrar);
  router.get('/', controller.listar);

  return router;
};