import type { Comment } from "../entities/comment.entity.js";

export interface ICommentRepository {
    save(comment: Comment): Promise<Comment>
    getByTicketId(ticketId: string): Promise<Comment[]>
}
