import 'dotenv/config';
import { crearServidor } from './infrastructure/http/server.js';

// Security Ports + Implementaciones
import { BcryptPasswordHasher } from './infrastructure/security/BcryptPasswordHasher.js'
import { JsonWebTokenService } from './infrastructure/security/JwtTokenService.js'

//User
import { UserController } from './infrastructure/http/controllers/user.controller.js';
import { InMemoryUserRepository } from './infrastructure/repositories/InMemoryUserRepository.js';
import { RegistrarUsuarioUseCase } from './application/use-cases/user/RegistrarUsuario.js';
import { ListarUsuariosUseCase } from './application/use-cases/user/ListarUsuarios.js';

//Auth
import { AuthController } from "./infrastructure/http/controllers/auth.controller.js"
import { AutenticarUsuarioUseCase } from "./application/use-cases/auth/AutenticarUsuario.js"

//Tickets
import { TicketController } from './infrastructure/http/controllers/ticket.controller.js';
import { InMemoryTicketRepository } from './infrastructure/repositories/InMemoryTicketRepository.js';
import { CrearTicketUseCase } from './application/use-cases/tickets/CrearTicket.js';
import { ObtenerTicketsUseCase } from './application/use-cases/tickets/ObtenerTickets.js';

const PORT = process.env.PORT ?? 3000;
const JWT_SECRET = process.env.JWT_SECRET ?? 'default-secret-inseguro';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

// --- Security ---
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JsonWebTokenService(JWT_SECRET, JWT_EXPIRES_IN);

// --- Users ---
const userRepository = new InMemoryUserRepository();
const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(userRepository, passwordHasher);
const listarUsuariosUseCase = new ListarUsuariosUseCase(userRepository);
const userController = new UserController(registrarUsuarioUseCase, listarUsuariosUseCase);

// --- Auth ---
const autenticarUsuarioUseCase = new AutenticarUsuarioUseCase(userRepository, passwordHasher, tokenService);
const authController = new AuthController(autenticarUsuarioUseCase);

// --- Tickets ---
const ticketRepository = new InMemoryTicketRepository();
const crearIncidenciaUseCase = new CrearTicketUseCase(ticketRepository);
const obtenerIncidenciasUseCase = new ObtenerTicketsUseCase(ticketRepository);
const ticketController = new TicketController(crearIncidenciaUseCase, obtenerIncidenciasUseCase);


const app = crearServidor({
  ticketController,
  userController,
  authController,
  tokenService, // lo pasamos para poder usarlo en middlewares de rutas protegidas
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});