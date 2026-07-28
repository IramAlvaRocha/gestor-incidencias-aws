import type { TicketStatus } from "../../../domain/entities/ticket.entity.js";
import { TicketNotFoundError } from "../../../domain/errors/TicketError.js";
import type { ITicketRepository } from "../../../domain/repositories/ITicketRepository.js"

interface ChageStatusTicketDTO {
    ticketId: string,
    newStatus: TicketStatus
}

export class ChangeStatusTicketUseCase {
    constructor(
        private readonly ticketRepository: ITicketRepository,
    ) {

    }

    async execute(data: ChageStatusTicketDTO) {
        const ticket = await this.ticketRepository.getById(data.ticketId);

        if(!ticket) throw new TicketNotFoundError();

        ticket.changeStatus(data.newStatus);

        return this.ticketRepository.update(ticket);
    }
}