import { env } from './config/env.js';
import { createServer } from './infrastructure/http/server.js';
import type { Application } from "express"

// Security Ports + Implementations
import { BcryptPasswordHasher } from './infrastructure/security/BcryptPasswordHasher.js'
import { JsonWebTokenService } from './infrastructure/security/JwtTokenService.js'

//User
import { UserController } from './infrastructure/http/controllers/user.controller.js';
import { PrismaUserRepository } from './infrastructure/repositories/PrismaUserRepository.js';
import { RegisterUserUseCase } from './application/use-cases/user/RegisterUser.js';
import { GetAllUsersUseCase } from './application/use-cases/user/GetAllUsers.js';

//Auth
import { AuthController } from "./infrastructure/http/controllers/auth.controller.js"
import { AuthenticateUserUseCase } from "./application/use-cases/auth/AuthenticateUser.js"

//Tickets
import { TicketController } from './infrastructure/http/controllers/ticket.controller.js';
import { PrismaTicketRepository } from './infrastructure/repositories/PrismaTicketRepository.js';
import { CreateTicketUseCase } from './application/use-cases/tickets/CreateTicket.js';
import { GetAllTicketsUseCase } from './application/use-cases/tickets/GetAllTickets.js';
import { ProjectController } from './infrastructure/http/controllers/project.controller.js';
import { PrismaProjectRepository } from './infrastructure/repositories/PrismaProjectRepository.js';
import { CreateProjectUseCase } from './application/use-cases/project/CreateProject.js';
import { GetAllProjectsUseCase } from './application/use-cases/project/GetAllProjects.js';
import { AddMemberToProject } from './application/use-cases/project/AddMemberToProject.js';
import { AssignTicketUseCase } from './application/use-cases/tickets/AssignTicket.js';
import { ChangeStatusTicketUseCase } from './application/use-cases/tickets/ChangeStatusTicket.js';
import { GetTicketByProjectUseCase } from './application/use-cases/tickets/GetTicketsByProject.js';
import { GetTicketByIdUseCase } from './application/use-cases/tickets/GetTicketById.js';
import { GetProjectById } from './application/use-cases/project/GetProjectById.js';

//Comments
import { CommentController } from './infrastructure/http/controllers/comment.controller.js';
import { PrismaCommentRepository } from './infrastructure/repositories/PrismaCommentRepository.js';
import { CreateCommentUseCase } from './application/use-cases/comment/CreateComment.js';
import { GetAllCommentsByTicketUseCase } from './application/use-cases/comment/GetAllCommentsByTicket.js';
import { prisma } from './infrastructure/database/prismaClient.js';
import { RequestUploadURLUseCase } from './application/use-cases/tickets/RequestUploadURL.js';
import { AddTicketAttachmentUseCase } from './application/use-cases/tickets/AddTicketAttachment.js';
import { GetTicketAttachmentsUseCase } from './application/use-cases/tickets/GetTicketAttachments.js';
import { S3StorageService } from './infrastructure/storage/S3StorageService.js';


export function buildApp(): Application {
    
const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;

// --- AWS Storage service ---
const storageService = new S3StorageService(
  process.env.S3_BUCKET_NAME!,
  process.env.AWS_REGION!
)

// --- Security ---
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JsonWebTokenService(JWT_SECRET, JWT_EXPIRES_IN);

// --- Users ---
const userRepository = new PrismaUserRepository(prisma);
const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const userController = new UserController(registerUserUseCase, getAllUsersUseCase);

// --- Auth ---
const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository, passwordHasher, tokenService);
const authController = new AuthController(authenticateUserUseCase, userRepository);

// --- Projects ---
const projectRepository = new PrismaProjectRepository(prisma);
const createProject = new CreateProjectUseCase(projectRepository);
const getAllProjects = new GetAllProjectsUseCase(projectRepository);
const addMember = new AddMemberToProject(projectRepository, userRepository);
const getProjectById = new GetProjectById(projectRepository);
const projectController = new ProjectController(
  createProject,
  getAllProjects,
  addMember,
  getProjectById,
);

// --- Tickets ---
const ticketRepository = new PrismaTicketRepository(prisma);
const createTicketUseCase = new CreateTicketUseCase(ticketRepository, projectRepository);
const getAllTicketsUseCase = new GetAllTicketsUseCase(ticketRepository);
const assignTicketUseCase = new AssignTicketUseCase(ticketRepository, projectRepository);
const changeStatusUseCase = new ChangeStatusTicketUseCase(ticketRepository);
const getTicketsByProjectUseCase = new GetTicketByProjectUseCase(ticketRepository);
const getTicketByIdUseCase = new GetTicketByIdUseCase(ticketRepository);
const requestUploadUrlUseCase = new RequestUploadURLUseCase(ticketRepository, storageService);
const addTicketAttachmentUseCase = new AddTicketAttachmentUseCase(ticketRepository, projectRepository);
const getTicketAttachmentsUseCase = new GetTicketAttachmentsUseCase(ticketRepository, storageService);

const ticketController = new TicketController(
  createTicketUseCase,
  getAllTicketsUseCase,
  assignTicketUseCase,
  changeStatusUseCase,
  getTicketsByProjectUseCase,
  getTicketByIdUseCase,
  addTicketAttachmentUseCase,
  requestUploadUrlUseCase,
  getTicketAttachmentsUseCase
);

// --- Comments ---
const commentRepository = new PrismaCommentRepository(prisma);
const createCommentUseCase = new CreateCommentUseCase(commentRepository, ticketRepository, projectRepository);
const getAllCommentsByTicketUseCase = new GetAllCommentsByTicketUseCase(commentRepository, ticketRepository);
const commentController = new CommentController(createCommentUseCase, getAllCommentsByTicketUseCase);

return createServer({
  ticketController,
  userController,
  authController,
  projectController,
  tokenService, // passed so it can be used in protected route middlewares
  commentController,
});

}