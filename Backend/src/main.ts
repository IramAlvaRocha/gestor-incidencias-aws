import 'dotenv/config';
import { InMemoryTicketRepository } from './infrastructure/repositories/InMemoryTicketRepository.js';
import { CrearTicketUseCase } from './application/use-cases/tickets/CrearTicket.js';
import { ObtenerTicketsUseCase } from './application/use-cases/tickets/ObtenerTickets.js';
import { TicketController } from './infrastructure/http/controllers/ticket.controller.js';
import { crearServidor } from './infrastructure/http/server.js';

const PORT = process.env.PORT ?? 3000;

// Composition Root: aquí se decide qué implementación concreta usar
const incidenciaRepository = new InMemoryTicketRepository();
const crearIncidenciaUseCase = new CrearTicketUseCase(incidenciaRepository);
const obtenerTicketsUseCase = new ObtenerTicketsUseCase(incidenciaRepository);
const ticketController = new TicketController(crearIncidenciaUseCase, obtenerTicketsUseCase);

const app = crearServidor(ticketController);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});