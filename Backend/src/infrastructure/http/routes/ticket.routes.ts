import { Router } from 'express';
import type { TicketController } from '../controllers/ticket.controller.js';
import type { ITokenService } from '../../../application/ports/ITokenService.js';
import { autenticate } from '../middlewares/authenticate.js';
import { autorize } from '../middlewares/authorize.js';

export const crearTicketRouter = (controller: TicketController, tokenService:ITokenService): Router => {
  const router = Router();

  router.get('/', autenticate(tokenService), controller.listar);
  router.post('/', autenticate(tokenService), autorize('Admin', 'Developer'), controller.crear);

  return router;
};