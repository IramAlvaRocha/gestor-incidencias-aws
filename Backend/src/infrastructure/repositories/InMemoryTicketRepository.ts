import type { Ticket } from "../../domain/entities/ticket.entity.js";
import type { ITicketRepository } from "../../domain/repositories/ITicketRepository.js";


export class InMemoryTicketRepository implements ITicketRepository
{
    private tickets: Ticket[] = [];

    async save(Ticket: Ticket): Promise<Ticket> {
        this.tickets.push(Ticket);
        return Ticket;
    }
    async getAll(): Promise<Ticket[]> {
        return this.tickets;
    }
    
}