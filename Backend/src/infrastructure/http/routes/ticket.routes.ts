import { Router } from 'express';
import type { TicketController } from '../controllers/ticket.controller.js';
import type { ITokenService } from '../../../application/ports/ITokenService.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { assignTicketSchema, changeStatusSchema } from '../validators/ticket.schema.js';

export const createTicketRouter = (controller: TicketController, tokenService:ITokenService): Router => {
  const router = Router();

  const auth = authenticate(tokenService);

  router.post('/', auth, controller.create);
  router.get('/', auth, controller.getAll);
  router.patch("/:id/assign", auth, validate(assignTicketSchema),controller.assign)
  router.patch("/:id/status", auth, validate(changeStatusSchema),controller.changeStatus)

  return router;
};