import express, { type Application } from 'express';
import cors from 'cors';
import type { TicketController } from './controllers/ticket.controller.js';
import { crearTicketRouter } from './routes/ticket.routes.js';


export const crearServidor = (ticketController: TicketController): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/ticket', crearTicketRouter(ticketController));

  app.get('/', (_req, res) => {
    res.send('API de Gestión de Tickets - Clean Architecture 🚀');
  });

  return app;
};