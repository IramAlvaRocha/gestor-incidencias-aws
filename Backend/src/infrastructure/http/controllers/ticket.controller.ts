import type { Request, Response } from 'express';
import type { CrearTicketUseCase } from '../../../application/use-cases/tickets/CrearTicket.js';
import type { ObtenerTicketsUseCase } from '../../../application/use-cases/tickets/ObtenerTickets.js';
import { crearTicketSchema } from '../validators/ticket.schema.js';

export class TicketController {
  constructor(
    private readonly crearTicketUseCase: CrearTicketUseCase,
    private readonly obtenerTicketUseCase: ObtenerTicketsUseCase
  ) {}

  crear = async (req: Request, res: Response) => {
  const resultado = crearTicketSchema.safeParse(req.body);

  if (!resultado.success) {
    return res.status(400).json({ errores: resultado.error.flatten().fieldErrors });
  }

  const { titulo, descripcion, prioridad } = resultado.data;
  const reporterId = req.usuarioAutenticado?.userId;

  if (!reporterId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  const ticket = await this.crearTicketUseCase.execute({
    titulo,
    descripcion,
    prioridad,
    reporterId,
  });

  return res.status(201).json(ticket);
};

  listar = async (_req: Request, res: Response) => {
    const tickets = await this.obtenerTicketUseCase.execute();
    return res.status(200).json(tickets);
  };
}