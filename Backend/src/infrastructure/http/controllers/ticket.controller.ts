import type { Request, Response } from 'express';
import type { CreateTicketUseCase } from '../../../application/use-cases/tickets/CreateTicket.js';
import type { GetAllTicketsUseCase } from '../../../application/use-cases/tickets/GetAllTickets.js';
import type { AssignTicketUseCase } from '../../../application/use-cases/tickets/AssignTicket.js';
import type { ChangeStatusTicketUseCase } from '../../../application/use-cases/tickets/ChangeStatusTicket.js';
import { MemberNotInProject } from '../../../domain/errors/ProjectError.js';
import { DomainError } from '../../../domain/errors/DomainError.js';

export class TicketController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly getAllTicketsUseCase: GetAllTicketsUseCase,
    private readonly assignTicketUseCase: AssignTicketUseCase,
    private readonly changeStatusUseCase: ChangeStatusTicketUseCase
  ) {}

  create = async (req: Request, res: Response) => {
    try {
      const reporterId = req.authenticatedUser!.userId;
      const ticket = await this.createTicketUseCase.execute({ ...req.body, reporterId})
      return res.status(201).json(ticket);
    }
    catch(error) {
      if(error instanceof MemberNotInProject || error instanceof DomainError){
        return res.status(400).json({
          error: error.message
        })
      }
      console.error(error);
      return res.status(500).json({ error: 'Error interno al crear el ticket' });
    }
  };

  getAll = async (_req: Request, res: Response) => {
    const tickets = await this.getAllTicketsUseCase.execute();
    return res.status(200).json(tickets);
  };

  assign = async(req: Request, res: Response) => {}
}