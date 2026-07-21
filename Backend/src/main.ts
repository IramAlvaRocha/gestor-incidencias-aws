import 'dotenv/config';
import { crearServidor } from './infrastructure/http/server.js';
import { CrearTicketUseCase } from './application/use-cases/tickets/CrearTicket.js';
import { InMemoryTicketRepository } from './infrastructure/repositories/InMemoryTicketRepository.js';
import { InMemoryUserRepository } from './infrastructure/repositories/InMemoryUserRepository.js';
import { ListarUsuariosUseCase } from './application/use-cases/user/ListarUsuarios.js';
import { ObtenerTicketsUseCase } from './application/use-cases/tickets/ObtenerTickets.js';
import { RegistrarUsuarioUseCase } from './application/use-cases/user/RegistrarUsuario.js';
import { TicketController } from './infrastructure/http/controllers/ticket.controller.js';
import { UserController } from './infrastructure/http/controllers/user.controller.js';

const PORT = process.env.PORT ?? 3000;

// --- Tickets ---
const ticketRepository = new InMemoryTicketRepository();
const crearIncidenciaUseCase = new CrearTicketUseCase(ticketRepository);
const obtenerIncidenciasUseCase = new ObtenerTicketsUseCase(ticketRepository);
const ticketController = new TicketController(crearIncidenciaUseCase, obtenerIncidenciasUseCase);

// --- Users ---
const userRepository = new InMemoryUserRepository();
const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(userRepository);
const listarUsuariosUseCase = new ListarUsuariosUseCase(userRepository);
const userController = new UserController(registrarUsuarioUseCase, listarUsuariosUseCase);

const app = crearServidor({ ticketController, userController });

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});