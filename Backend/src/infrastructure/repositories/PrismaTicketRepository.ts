import { Ticket, type Priority, type TicketStatus, type TicketType } from "../../domain/entities/ticket.entity.js";
import type { ITicketRepository } from "../../domain/repositories/ITicketRepository.js";
import { PrismaClient, Prisma } from "../../generated/prisma/client.js";



type TicketRow = {
    id: string; key: string; title: string; description: string;
    type: string; priority: string; status: string; projectId: string;
    reporterId: string; assigneeId: string | null; attachments: Prisma.JsonValue;
    createdAt: Date; updatedAt: Date;
  };

export class PrismaTicketRepository implements ITicketRepository {
    constructor(
        private readonly prisma: PrismaClient
    ) {}

    async findByProjectId(projectId: string): Promise<Ticket[]> {
        const tickets = await this.prisma.ticket.findMany({ where: { projectId } });
        return tickets.map((row) => this.toDomain(row));
    }
    
    async save(ticket: Ticket): Promise<Ticket> {
        await this.prisma.ticket.create({
            data: {
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
                updatedAt: ticket.updatedAt
            }
        });
        
        return ticket;
    }
    async update(ticket: Ticket): Promise<Ticket> {
        await this.prisma.ticket.update({
            where: { id: ticket.id },
            data: {
                title: ticket.title,
                description: ticket.description,
                type: ticket.type,
                priority: ticket.priority,
                status: ticket.status,
                assigneeId: ticket.assigneeId,
                updatedAt: ticket.updatedAt,
            },
        });
        return ticket;
    }
    async getAll(): Promise<Ticket[]> {
        const tickets = await this.prisma.ticket.findMany();
        return tickets.map(this.toDomain);
    }
    async getById(id: string): Promise<Ticket | null> {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
        });
        return ticket ? this.toDomain(ticket) : null;
    }
    async countByProjectId(projectId: string): Promise<number> {
        const count = await this.prisma.ticket.count({
            where: { projectId },
        });
        return count;
    }
 
    private toDomain(row: TicketRow): Ticket {
        return Ticket.reconstruct({
          id: row.id,
          key: row.key,
          title: row.title,
          description: row.description,
          type: row.type as TicketType,
          priority: row.priority as Priority,
          status: row.status as TicketStatus,
          projectId: row.projectId,
          reporterId: row.reporterId,
          assigneeId: row.assigneeId,
          attachments: (row.attachments as string[]) ?? [],
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        });
    }
}