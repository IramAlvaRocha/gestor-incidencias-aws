import { env } from './config/env.js';
import { createServer } from './infrastructure/http/server.js';

// Security Ports + Implementations
import { BcryptPasswordHasher } from './infrastructure/security/BcryptPasswordHasher.js'
import { JsonWebTokenService } from './infrastructure/security/JwtTokenService.js'

//User
import { UserController } from './infrastructure/http/controllers/user.controller.js';
import { InMemoryUserRepository } from './infrastructure/repositories/InMemoryUserRepository.js';
import { RegisterUserUseCase } from './application/use-cases/user/RegisterUser.js';
import { GetAllUsersUseCase } from './application/use-cases/user/GetAllUsers.js';

//Auth
import { AuthController } from "./infrastructure/http/controllers/auth.controller.js"
import { AuthenticateUserUseCase } from "./application/use-cases/auth/AuthenticateUser.js"

//Tickets
import { TicketController } from './infrastructure/http/controllers/ticket.controller.js';
import { InMemoryTicketRepository } from './infrastructure/repositories/InMemoryTicketRepository.js';
import { CreateTicketUseCase } from './application/use-cases/tickets/CreateTicket.js';
import { GetAllTicketsUseCase } from './application/use-cases/tickets/GetAllTickets.js';
import { ProjectController } from './infrastructure/http/controllers/project.controller.js';
import { InMemoryProjectRepository } from './infrastructure/repositories/InMemoryProjectRepository.js';
import { CreateProjectUseCase } from './application/use-cases/project/CreateProject.js';
import { GetAllProjectsUseCase } from './application/use-cases/project/GetAllProjects.js';
import { AddMemberToProject } from './application/use-cases/project/AddMemberToProject.js';
import { AssignTicketUseCase } from './application/use-cases/tickets/AssignTicket.js';
import { ChangeStatusTicketUseCase } from './application/use-cases/tickets/ChangeStatusTicket.js';

//Comments
import { CommentController } from './infrastructure/http/controllers/comment.controller.js';
import { InMemoryCommentRepository } from './infrastructure/repositories/InMemoryCommentRepository.js';
import { CreateCommentUseCase } from './application/use-cases/comment/CreateComment.js';
import { GetAllCommentsByTicketUseCase } from './application/use-cases/comment/GetAllCommentsByTicket.js';

const PORT = env.PORT;
const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;

// --- Security ---
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JsonWebTokenService(JWT_SECRET, JWT_EXPIRES_IN);

// --- Users ---
const userRepository = new InMemoryUserRepository();
const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const userController = new UserController(registerUserUseCase, getAllUsersUseCase);

// --- Auth ---
const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository, passwordHasher, tokenService);
const authController = new AuthController(authenticateUserUseCase);

// --- Projects ---
const projectRepository = new InMemoryProjectRepository();
const createProject = new CreateProjectUseCase(projectRepository);
const getAllProjects = new GetAllProjectsUseCase(projectRepository);
const addMember = new AddMemberToProject(projectRepository,userRepository);
const projectController = new ProjectController(createProject,getAllProjects,addMember);

// --- Tickets ---
const ticketRepository = new InMemoryTicketRepository();
const createTicketUseCase = new CreateTicketUseCase(ticketRepository, projectRepository);
const getAllTicketsUseCase = new GetAllTicketsUseCase(ticketRepository);
const assignTicketUseCase = new AssignTicketUseCase(ticketRepository, projectRepository);
const changeStatusUseCase = new ChangeStatusTicketUseCase(ticketRepository);
const ticketController = new TicketController(
  createTicketUseCase,
  getAllTicketsUseCase,
  assignTicketUseCase,
  changeStatusUseCase,
);

// --- Comments ---
const commentRepository = new InMemoryCommentRepository();
const createCommentUseCase = new CreateCommentUseCase(commentRepository, ticketRepository, projectRepository);
const getAllCommentsByTicketUseCase = new GetAllCommentsByTicketUseCase(commentRepository, ticketRepository);
const commentController = new CommentController(createCommentUseCase, getAllCommentsByTicketUseCase);

const app = createServer({
  ticketController,
  userController,
  authController,
  projectController,
  tokenService, // passed so it can be used in protected route middlewares
  commentController,
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});