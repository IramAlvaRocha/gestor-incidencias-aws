import { TicketNotFoundError } from "../../../domain/errors/TicketError.js";
import type { ICommentRepository } from "../../../domain/repositories/ICommentRepository.js";
import type { ITicketRepository } from "../../../domain/repositories/ITicketRepository.js";

interface GetAllCommentsByTicketProps {
    ticketId: string;
}

export class GetAllCommentsByTicketUseCase { 
    constructor(
        private readonly commentRepository: ICommentRepository,
        private readonly ticketRepository: ITicketRepository
    ){
    }

    async execute(data: GetAllCommentsByTicketProps) {
        const ticket = await this.ticketRepository.getById(data.ticketId);
        if(!ticket) throw new TicketNotFoundError();

        const comments = await this.commentRepository.getByTicketId(data.ticketId);
        return comments;

    }
}