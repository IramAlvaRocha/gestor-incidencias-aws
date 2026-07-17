import type { Ticket } from "../entities/ticket.entity.js";


export interface ITicketRepository {
    save(incidencia: Ticket): Promise<Ticket>;
    getAll(): Promise<Ticket[]>;    
}