import type { Ticket } from "../entities/ticket.entity.js";


export interface ITicketRepository {
    save(ticket: Ticket): Promise<Ticket>;
    update(ticket: Ticket): Promise<Ticket>;
    getAll(): Promise<Ticket[]>;
    getById(id: string): Promise<Ticket | null>;
    findByProjectId(id: string): Promise<Ticket[]>
    countByProjectId(projectId: string): Promise<number>;
}