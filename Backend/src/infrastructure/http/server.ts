import type { TicketController } from "./controllers/ticket.controller.js";
import type { UserController } from "./controllers/user.controller.js";
import express, { type Application } from "express";
import cors from "cors"
import { crearUserRouter } from "./routes/user.routes.js";
import { crearTicketRouter } from "./routes/ticket.routes.js";

interface Controllers {
  ticketController: TicketController;
  userController: UserController;
}

export const crearServidor = ({ ticketController, userController }: Controllers): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/tickets', crearTicketRouter(ticketController));
  app.use('/api/users', crearUserRouter(userController));

  app.get('/', (_req, res) => {
    res.send('API Mini-Jira - Clean Architecture 🚀');
  });

  return app;
};

