import type { Comment } from "../../domain/entities/comment.entity.js";
import type { ICommentRepository } from "../../domain/repositories/ICommentRepository.js";

export class InMemoryCommentRepository implements ICommentRepository {
    
    private comments: Comment[] = [];
    
    async save(comment: Comment): Promise<Comment> {
        this.comments.push(comment);
        return comment
    }
    
    async getByTicketId(ticketId: string): Promise<Comment[]> {
        return this.comments.filter((c) => c.ticketId === ticketId);
    }
    
}
