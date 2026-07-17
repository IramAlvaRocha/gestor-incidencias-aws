import type { Request, Response } from 'express';
import type { CrearTicketUseCase } from '../../../application/use-cases/tickets/CrearTicket.js';
import type { ObtenerTicketsUseCase } from '../../../application/use-cases/tickets/ObtenerTickets.js';
import { crearTicketSchema } from '../validators/ticket.schema.js';

export class TicketController {
  constructor(
    private readonly crearTickerUseCase: CrearTicketUseCase,
    private readonly obtenerTickerUseCase: ObtenerTicketsUseCase
  ) {}

  crear = async (req: Request, res: Response) => {
  const resultado = crearTicketSchema.safeParse(req.body);

  if (!resultado.success) {
    return res.status(400).json({ errores: resultado.error.flatten().fieldErrors });
  }

  const { titulo, descripcion, prioridad } = resultado.data;

  const incidencia = await this.crearTickerUseCase.execute({
    titulo,
    descripcion,
    prioridad, // ya es Prioridad | undefined, coincide con el DTO
  });

  return res.status(201).json(incidencia);
};

  listar = async (_req: Request, res: Response) => {
    const incidencias = await this.obtenerTickerUseCase.execute();
    return res.status(200).json(incidencias);
  };
}