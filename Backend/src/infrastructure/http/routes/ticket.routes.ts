import { Router } from "express";
import type { TicketController } from "../controllers/ticket.controller.js";
import type { ITokenService } from "../../../application/ports/ITokenService.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import type { CommentController } from "../controllers/comment.controller.js";
import { createCommentRouter } from "./comment.routes.js";
import {
  assignTicketSchema,
  changeStatusSchema,
  createTicketSchema,
} from "../validators/ticket.schema.js";

export const createTicketRouter = (
  controller: TicketController,
  commentController: CommentController,
  tokenService: ITokenService,
): Router => {
  const router = Router();
  const auth = authenticate(tokenService);

  router.post("/", auth, validate(createTicketSchema), controller.create);
  router.get("/", auth, controller.getAll);
  router.patch("/:id/assign", auth, validate(assignTicketSchema), controller.assign);
  router.patch("/:id/status", auth, validate(changeStatusSchema), controller.changeStatus);

  //Rutas anidadas de comentarios
  router.use("/:id/comments", createCommentRouter(commentController, tokenService));

  return router;
};
