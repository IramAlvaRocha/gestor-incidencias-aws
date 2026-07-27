import { randomUUID } from "crypto";
import { Ticket, type Priority, type TicketType } from "../../../domain/entities/ticket.entity.js";
import type { ITicketRepository } from "../../../domain/repositories/ITicketRepository.js";
import type { IProjectRepository } from "../../../domain/repositories/IProjectRepository.js";
import { MemberNotInProject, ProjectNotFoundError } from "../../../domain/errors/ProjectError.js";

interface CreateTicketDTO { 
    title: string;
    description: string;
    priority?: Priority | undefined;
    reporterId: string;
    type: TicketType;
    projectId: string;
}


export class CreateTicketUseCase { 
    constructor(
        private readonly ticketRepository: ITicketRepository,
        private readonly projectRepository: IProjectRepository
    ){}

    async execute(data: CreateTicketDTO): Promise<Ticket> {

        const project = await this.projectRepository.getById(data.projectId);
        if(!project) throw new ProjectNotFoundError(data.projectId);

        if(!project.isMember(data.reporterId)) throw new MemberNotInProject();

        const totalTickets = await this.ticketRepository.countByProjectId(data.projectId);
        const id = randomUUID();
        const key = `${project.key}-${totalTickets + 1}`;
        const now = new Date();

        const newTicket = Ticket.create({
            id,
            key,
            title: data.title,
            description: data.description,
            type: data.type,
            priority: data.priority ?? "Baja",
            reporterId: data.reporterId,
            projectId: data.projectId ?? "default",
            createdAt: now,
        })

        return this.ticketRepository.save(newTicket);
    }

}