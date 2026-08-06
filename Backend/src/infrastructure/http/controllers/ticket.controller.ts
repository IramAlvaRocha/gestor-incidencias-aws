import type { Request, Response } from "express";
import type { CreateTicketUseCase } from "../../../application/use-cases/tickets/CreateTicket.js";
import type { GetAllTicketsUseCase } from "../../../application/use-cases/tickets/GetAllTickets.js";
import type { AssignTicketUseCase } from "../../../application/use-cases/tickets/AssignTicket.js";
import type { ChangeStatusTicketUseCase } from "../../../application/use-cases/tickets/ChangeStatusTicket.js";
import { handleControllerError } from "../errors/handleControllerError.js";
import type { GetTicketByProjectUseCase } from "../../../application/use-cases/tickets/GetTicketsByProject.js";
import type { GetTicketByIdUseCase } from "../../../application/use-cases/tickets/GetTicketById.js";
import { DomainError } from "../../../domain/errors/DomainError.js";
import type { AddTicketAttachmentUseCase } from "../../../application/use-cases/tickets/AddTicketAttachment.js";
import type { RequestUploadURLUseCase } from "../../../application/use-cases/tickets/RequestUploadURL.js";
import type { GetTicketAttachmentsUseCase } from "../../../application/use-cases/tickets/GetTicketAttachments.js";

export class TicketController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly getAllTicketsUseCase: GetAllTicketsUseCase,
    private readonly assignTicketUseCase: AssignTicketUseCase,
    private readonly changeStatusUseCase: ChangeStatusTicketUseCase,
    private readonly getTickets: GetTicketByProjectUseCase,
    private readonly getTicketByIdUseCase: GetTicketByIdUseCase,
    private readonly addAttachmentUseCase: AddTicketAttachmentUseCase,
    private readonly requestUploadURLUseCase: RequestUploadURLUseCase,
    private readonly getTicketAttachmentsUseCase: GetTicketAttachmentsUseCase,
  ) {}

  create = async (req: Request, res: Response) => {
    try {
      const reporterId = req.authenticatedUser!.userId;
      const ticket = await this.createTicketUseCase.execute({
        ...req.body,
        reporterId,
      });
      return res.status(201).json(this.toResponse(ticket));
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
    return res
      .status(200)
      .json(tickets.map((ticket) => this.toResponse(ticket)));
  };

  list = async (req: Request, res: Response) => {
    const projectId = req.query.projectId as string | undefined;
    const tickets = await this.getTickets.execute({ projectId });
    return res
      .status(200)
      .json(tickets.map((ticket) => this.toResponse(ticket)));
  };

  getById = async (req: Request, res: Response) => {
    try {
      const ticket = await this.getTicketByIdUseCase.execute(
        req.params.id as string,
      );
      return res.status(200).json(this.toResponse(ticket));
    } catch (error) {
      if (error instanceof DomainError) {
        return res.status(404).json({ error: error.message });
      }
      console.error(error);
      return res
        .status(500)
        .json({ error: "Error interno al obtener el ticket" });
    }
  };

  assign = async (req: Request, res: Response) => {
    try {
      const { id: ticketId } = req.params;
      const ticket = await this.assignTicketUseCase.execute({
        ticketId: ticketId as string,
        assigneeId: req.body.assigneeId,
      });
      return res.status(200).json(this.toResponse(ticket));
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
      return res.status(200).json(this.toResponse(ticket));
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Internal error while changing the ticket status",
      );
    }
  };

  addAttachment = async (req: Request, res: Response) => {
    const user = req.authenticatedUser!.userId;

    try {
      const ticket = await this.addAttachmentUseCase.execute({
        ticketId: req.params.id as string,
        key: req.body.key,
        userId: user,
      });

      return res.status(200).json(ticket);
    } catch (error) {
      if (error instanceof DomainError) {
        return res.status(400).json({
          error: error.message,
        });
        console.error(error);
        return res.status(500).json({ error: "Error al guardar el adjunto" });
      }
    }
  };

  requestUploadUrl = async (req: Request, res: Response) => {
    try {
      const result = await this.requestUploadURLUseCase.execute({
        ticketId: req.params.id as string,
        fileName: req.body.fileName,
        contentType: req.body.contentType,
      });

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof DomainError) {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: "Error al obtener URL de subida" });
    }
  };

  getAttachments = async (req: Request, res: Response) => {
    try {
      const attachments = await this.getTicketAttachmentsUseCase.execute(
        req.params.id as string,
      );
      return res.status(200).json(attachments);
    } catch (error) {
      if (error instanceof DomainError) {
        return res.status(404).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: "Error al obtener adjuntos" });
    }
  };

  private toResponse(ticket: {
    id: string;
    key: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    status: string;
    projectId: string;
    reporterId: string;
    assigneeId: string | null;
    attachments: string[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: ticket.id,
      key: ticket.key,
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      priority: ticket.priority,
      status: ticket.status,
      projectId: ticket.projectId,
      reporterId: ticket.reporterId,
      assigneeId: ticket.assigneeId,
      attachments: ticket.attachments,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }
}
