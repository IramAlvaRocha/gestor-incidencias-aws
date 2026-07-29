import type { ITicketRepository } from "../../../domain/repositories/ITicketRepository.js";
import type { IProjectRepository } from "../../../domain/repositories/IProjectRepository.js";
import type { ICommentRepository } from "../../../domain/repositories/ICommentRepository.js";
import { NotAuthorizedToCommentError, TicketNotFoundError } from "../../../domain/errors/CommentError.js";
import { Comment } from "../../../domain/entities/comment.entity.js";
import { randomUUID } from "crypto";

interface CreateCommentProps {
    ticketId: string;
    userId: string;
    content: string;
}

export class CreateCommentUseCase {
    constructor(
        private readonly ticketRepository: ITicketRepository,
        private readonly projectRepository: IProjectRepository,
        private readonly commentRepository: ICommentRepository,
    ){

    }

    async execute(data: CreateCommentProps){
        const ticket = await this.ticketRepository.getById(data.ticketId);
        if(!ticket) 
            throw new TicketNotFoundError(data.ticketId);

        const project = await this.projectRepository.getById(ticket.projectId);
        if(!project || !project.isMember(data.userId)) 
            throw new NotAuthorizedToCommentError(data.userId, ticket.projectId);

        const newComment = Comment.create({
            id: randomUUID(),
            ticketId: data.ticketId,
            userId: data.userId,
            content: data.content,
            createdAt: new Date(),
        })

        await this.commentRepository.save(newComment);
    }
}