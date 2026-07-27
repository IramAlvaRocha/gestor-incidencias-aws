import { Router } from 'express';
import type { TicketController } from '../controllers/ticket.controller.js';
import type { ITokenService } from '../../../application/ports/ITokenService.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

export const createTicketRouter = (controller: TicketController, tokenService:ITokenService): Router => {
  const router = Router();

  router.get('/', authenticate(tokenService), controller.getAll);
  router.post('/', authenticate(tokenService), authorize('Admin', 'Developer'), controller.create);

  return router;
};