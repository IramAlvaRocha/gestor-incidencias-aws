import { randomUUID } from "crypto";
import { Ticket, type Priority, type TicketType } from "../../../domain/entities/ticket.entity.js";
import type { ITicketRepository } from "../../../domain/repositories/ITicketRepository.js";

interface CreateTicketDTO { 
    title: string;
    description: string;
    priority?: Priority | undefined;
    reporterId: string;
    type?: TicketType | undefined;
    projectId?: string | undefined;
}


export class CreateTicketUseCase { 
    constructor(
        public readonly repository: ITicketRepository
    ){}

    async execute(data: CreateTicketDTO): Promise<Ticket> {
        const id = randomUUID();
        const key = `INC-${id.slice(0, 8)}`;
        const now = new Date();

        const newTicket = Ticket.create({
            id,
            key,
            title: data.title,
            description: data.description,
            type: data.type ?? "Tarea",
            priority: data.priority ?? "Baja",
            reporterId: data.reporterId,
            projectId: data.projectId ?? "default",
            createdAt: now,
        })

        return this.repository.save(newTicket);
    }

}