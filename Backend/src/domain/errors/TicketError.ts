import { DomainError } from "./DomainError.js";

export class InvalidTitleError extends DomainError {
    constructor() {
        super("Ticket title is not valid.")
    }
}

export class InvalidDescriptionError extends DomainError {
    constructor() {
        super("Ticket description is not valid.")
    }
}

export class TicketNotFoundError extends DomainError {
    constructor() {
        super("No ticket was found with the provided id")
    }
}
