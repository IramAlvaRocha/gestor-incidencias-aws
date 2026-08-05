import type { Ticket } from "../../domain/entities/ticket.entity.js";
import type { ITicketRepository } from "../../domain/repositories/ITicketRepository.js";

export class InMemoryTicketRepository implements ITicketRepository {
  private tickets: Ticket[] = [];

  async findByProjectId(id: string): Promise<Ticket[]> {
    return this.tickets.filter(t => t.projectId === id)
  }

  async save(Ticket: Ticket): Promise<Ticket> {
    this.tickets.push(Ticket);
    return Ticket;
  }
  async getAll(): Promise<Ticket[]> {
    return this.tickets;
  }

  async getById(id: string): Promise<Ticket | null> {
    const ticket = this.tickets.find((t) => t.id === id);
    return ticket ?? null;
  }

  async update(ticket: Ticket): Promise<Ticket> {
    const index = this.tickets.findIndex((t) => t.id === ticket.id);
    if (index !== -1) {
      this.tickets[index] = ticket;
    }
    return ticket;
  }

  async countByProjectId(projectId: string): Promise<number> {
    return this.tickets.filter((t) => t.projectId === projectId).length;
  }
}
