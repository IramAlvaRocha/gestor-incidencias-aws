import { DomainError } from "./DomainError.js";

export class InvalidTitleError extends DomainError {
    constructor() {
        super("Ticket title must be at least 3 characters.")
    }
}

export class InvalidDescriptionError extends DomainError {
    constructor() {
        super("Ticket description must be at least 20 characters.")
    }
}

export class TicketNotFoundError extends DomainError {
    constructor() {
        super("No ticket was found with the provided id")
    }
}
