import type { Ticket } from "../entities/ticket.entity.js";


export interface ITicketRepository {
    save(ticket: Ticket): Promise<Ticket>;
    getAll(): Promise<Ticket[]>;    
}