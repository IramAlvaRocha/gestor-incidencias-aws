import express, { type Application } from 'express';
import cors from 'cors';

// Controllers
import { TicketController } from './controllers/ticket.controller.js';
import { UserController } from './controllers/user.controller.js';
import { AuthController } from './controllers/auth.controller.js';

// Routes
import {  crearTicketRouter } from './routes/ticket.routes.js';
import { crearUserRouter } from './routes/user.routes.js';
import { crearAuthRouter } from './routes/auth.routes.js';

// Ports (para poder construir el middleware de autenticación aquí)
import { type ITokenService } from '../../application/ports/ITokenService.js';

interface ServerDependencies {
  ticketController: TicketController;
  userController: UserController;
  authController: AuthController;
  tokenService: ITokenService;
}

export const crearServidor = ({
  ticketController,
  userController,
  authController,
  tokenService,
}: ServerDependencies): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Rutas públicas
  app.use('/api/auth', crearAuthRouter(authController));

  // Rutas que pueden tener endpoints protegidos internamente
  app.use('/api/users', crearUserRouter(userController, tokenService));
  app.use('/api/tickets', crearTicketRouter(ticketController, tokenService));

  app.get('/', (_req, res) => {
    res.send('API Mini-Jira - Clean Architecture 🚀');
  });

  return app;
};