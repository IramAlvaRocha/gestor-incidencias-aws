import { MemberNotInProject } from "../../../domain/errors/ProjectError.js";
import { TicketNotFoundError } from "../../../domain/errors/TicketError.js";
import type { IProjectRepository } from "../../../domain/repositories/IProjectRepository.js"
import type { ITicketRepository } from "../../../domain/repositories/ITicketRepository.js"

interface AddTicketAttachmentDTO {
    ticketId: string;
    userId: string;
    key: string;
}

export class AddTicketAttachmentUseCase {
    constructor(
        private readonly ticketRepository: ITicketRepository,
        private readonly projectRepository: IProjectRepository   
    ) {}

    async execute(data: AddTicketAttachmentDTO) {
        const ticket = await this.ticketRepository.getById(data.ticketId);

        if(!ticket)
            throw new TicketNotFoundError();

        const project = await this.projectRepository.getById(ticket.projectId);
        
        if(!project || !project.isMember(data.userId))
            throw new MemberNotInProject();

        ticket.addAttachment(data.key);

        return this.ticketRepository.update(ticket);
    }
}