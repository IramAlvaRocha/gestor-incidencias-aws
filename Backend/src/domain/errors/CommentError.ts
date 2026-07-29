import { DomainError } from "./DomainError.js";

export class InvalidCommentError extends DomainError {
    constructor() {
        super("Invalid comment content")
    }
}

export class CommentNotFoundError extends DomainError {
    constructor(commentId: string) {
        super(`Comment with id ${commentId} not found`)
    }
}

export class TicketNotFoundError extends DomainError {
    constructor(ticketId: string) {
        super(`Ticket with id ${ticketId} not found`)

    }
}

export class NotAuthorizedToCommentError extends DomainError {
    constructor(userId: string, ticketId: string) {
        super(`User with id ${userId} is not authorized to comment on ticket with id ${ticketId}`)
    }
}

