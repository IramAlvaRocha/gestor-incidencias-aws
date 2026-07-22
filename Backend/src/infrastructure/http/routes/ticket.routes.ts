import { Router } from 'express';
import type { TicketController } from '../controllers/ticket.controller.js';
import type { ITokenService } from '../../../application/ports/ITokenService.js';

export const crearTicketRouter = (controller: TicketController, tokenService:ITokenService): Router => {
  const router = Router();

  router.get('/', controller.listar);
  router.post('/', controller.crear);

  return router;
};