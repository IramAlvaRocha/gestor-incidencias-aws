import type { Request, Response } from "express";
import type { CreateTicketUseCase } from "../../../application/use-cases/tickets/CreateTicket.js";
import type { GetAllTicketsUseCase } from "../../../application/use-cases/tickets/GetAllTickets.js";
import type { AssignTicketUseCase } from "../../../application/use-cases/tickets/AssignTicket.js";
import type { ChangeStatusTicketUseCase } from "../../../application/use-cases/tickets/ChangeStatusTicket.js";
import { handleControllerError } from "../errors/handleControllerError.js";

export class TicketController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly getAllTicketsUseCase: GetAllTicketsUseCase,
    private readonly assignTicketUseCase: AssignTicketUseCase,
    private readonly changeStatusUseCase: ChangeStatusTicketUseCase,
  ) {}

  create = async (req: Request, res: Response) => {
    try {
      const reporterId = req.authenticatedUser!.userId;
      const ticket = await this.createTicketUseCase.execute({
        ...req.body,
        reporterId,
      });
      return res.status(201).json(ticket);
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Internal error while creating the ticket",
      );
    }
  };

  getAll = async (_req: Request, res: Response) => {
    const tickets = await this.getAllTicketsUseCase.execute();
    return res.status(200).json(tickets);
  };

  assign = async (req: Request, res: Response) => {
    try {
      const { id: ticketId } = req.params;
      const ticket = await this.assignTicketUseCase.execute({
        ticketId: ticketId as string,
        assigneeId: req.body.assigneeId,
      });
      return res.status(200).json(ticket);
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Internal error while assigning the ticket",
      );
    }
  };

  changeStatus = async (req: Request, res: Response) => {
    try {
      const { id: ticketId } = req.params;
      const ticket = await this.changeStatusUseCase.execute({
        ticketId: ticketId as string,
        newStatus: req.body.status,
      });
      return res.status(200).json(ticket);
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Internal error while changing the ticket status",
      );
    }
  };
}
