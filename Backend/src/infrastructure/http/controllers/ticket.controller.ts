import type { Request, Response } from 'express';
import type { CreateTicketUseCase } from '../../../application/use-cases/tickets/CreateTicket.js';
import type { GetAllTicketsUseCase } from '../../../application/use-cases/tickets/GetAllTickets.js';
import { createTicketSchema } from '../validators/ticket.schema.js';

export class TicketController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly getAllTicketsUseCase: GetAllTicketsUseCase
  ) {}

  create = async (req: Request, res: Response) => {
  const result = createTicketSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { title, description, priority } = result.data;
  const reporterId = req.authenticatedUser?.userId;

  if (!reporterId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  const ticket = await this.createTicketUseCase.execute({
    title,
    description,
    priority,
    reporterId,
  });

  return res.status(201).json(ticket);
};

  getAll = async (_req: Request, res: Response) => {
    const tickets = await this.getAllTicketsUseCase.execute();
    return res.status(200).json(tickets);
  };
}