import { Comment } from "../../domain/entities/comment.entity.js";
import type { ICommentRepository } from "../../domain/repositories/ICommentRepository.js";
import type { PrismaClient } from "../../generated/prisma/client.js";

export class PrismaCommentRepository implements ICommentRepository {
    
    constructor(private readonly prisma: PrismaClient) {}

    async save(comment: Comment): Promise<Comment> {
        await this.prisma.comment.create({
            data: {
                id: comment.id,
                ticketId: comment.ticketId,
                userId: comment.userId,
                content: comment.content,
                createdAt: comment.createdAt,
            }            
        });
        return comment;
    }
    
    async getByTicketId(ticketId: string): Promise<Comment[]> {
        const comments = await this.prisma.comment.findMany({
            where: { ticketId },
        });

        return comments.map(c => {
            return Comment.reconstruct({
                id: c.id,
                ticketId: c.ticketId,
                userId: c.userId,
                content: c.content,
                createdAt: c.createdAt,
            })
        });
    }

 }