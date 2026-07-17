import { Router } from 'express';
import type { TicketController } from '../controllers/ticket.controller.js';

export const crearTicketRouter = (controller: TicketController): Router => {
  const router = Router();

  router.get('/', controller.listar);
  router.post('/', controller.crear);

  return router;
};