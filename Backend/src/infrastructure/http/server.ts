import express, { type Application } from 'express';
import cors from 'cors';

// Controllers
import { TicketController } from './controllers/ticket.controller.js';
import { UserController } from './controllers/user.controller.js';
import { AuthController } from './controllers/auth.controller.js';
import { CommentController } from './controllers/comment.controller.js';
// Routes
import {  createTicketRouter } from './routes/ticket.routes.js';
import { createUserRouter } from './routes/user.routes.js';
import { createAuthRouter } from './routes/auth.routes.js';

// Ports (needed to build the authentication middleware here)
import { type ITokenService } from '../../application/ports/ITokenService.js';
import { createProjectRouter } from './routes/project.routes.js';
import { ProjectController } from './controllers/project.controller.js';
import cookieParser from 'cookie-parser';

interface ServerDependencies {
  ticketController: TicketController;
  userController: UserController;
  authController: AuthController;
  projectController: ProjectController;
  tokenService: ITokenService;
  commentController: CommentController;
}

export const createServer = ({
  ticketController,
  userController,
  authController,
  projectController,
  tokenService,
  commentController,
}: ServerDependencies): Application => {

  const app = express();

  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
  }));
  app.use(cookieParser())
  app.use(express.json());

  // Public routes
  app.use('/api/auth', createAuthRouter(authController, tokenService));

  // Routes that may have internally protected endpoints
  app.use('/api/users', createUserRouter(userController, tokenService));
  app.use('/api/tickets', createTicketRouter(ticketController, commentController, tokenService));
  app.use('/api/projects', createProjectRouter(projectController, tokenService));

  app.get('/', (_req, res) => res.send('API Mini-Jira - Clean Architecture 🚀'));


  return app;
};