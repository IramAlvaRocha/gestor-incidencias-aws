import 'dotenv/config';
import { createServer } from './infrastructure/http/server.js';

// Security Ports + Implementaciones
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

const PORT = process.env.PORT ?? 3000;
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET no definido en .env. Usando fallback inseguro para desarrollo.');
}
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-no-usar-en-produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

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

// --- Tickets ---
const ticketRepository = new InMemoryTicketRepository();
const createTicketUseCase = new CreateTicketUseCase(ticketRepository);
const getAllTicketsUseCase = new GetAllTicketsUseCase(ticketRepository);
const ticketController = new TicketController(createTicketUseCase, getAllTicketsUseCase);

// --- Projects ---
const projectRepository = new InMemoryProjectRepository();
const createProject = new CreateProjectUseCase(projectRepository);
const getAllProjects = new GetAllProjectsUseCase(projectRepository);
const addMember = new AddMemberToProject(projectRepository,userRepository);
const projectController = new ProjectController(createProject,getAllProjects,addMember);

const app = createServer({
  ticketController,
  userController,
  authController,
  projectController,
  tokenService, // lo pasamos para poder usarlo en middlewares de rutas protegidas
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});