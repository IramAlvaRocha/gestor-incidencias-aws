import express, { type Application } from 'express';
import cors from 'cors';

// Controllers
import { TicketController } from './controllers/ticket.controller.js';
import { UserController } from './controllers/user.controller.js';
import { AuthController } from './controllers/auth.controller.js';

// Routes
import {  createTicketRouter } from './routes/ticket.routes.js';
import { createUserRouter } from './routes/user.routes.js';
import { createAuthRouter } from './routes/auth.routes.js';

// Ports (para poder construir el middleware de autenticación aquí)
import { type ITokenService } from '../../application/ports/ITokenService.js';
import { createProjectRouter } from './routes/project.routes.js';
import { ProjectController } from './controllers/project.controller.js';

interface ServerDependencies {
  ticketController: TicketController;
  userController: UserController;
  authController: AuthController;
  projectController: ProjectController;
  tokenService: ITokenService;
}

export const createServer = ({
  ticketController,
  userController,
  authController,
  projectController,
  tokenService,
}: ServerDependencies): Application => {

  const app = express();

  app.use(cors());
  app.use(express.json());

  // Rutas públicas
  app.use('/api/auth', createAuthRouter(authController));

  // Rutas que pueden tener endpoints protegidos internamente
  app.use('/api/users', createUserRouter(userController, tokenService));
  app.use('/api/tickets', createTicketRouter(ticketController, tokenService));
  app.use('/api/projects', createProjectRouter(projectController, tokenService));

  app.get('/', (_req, res) => res.send('API Mini-Jira - Clean Architecture 🚀'));


  return app;
};