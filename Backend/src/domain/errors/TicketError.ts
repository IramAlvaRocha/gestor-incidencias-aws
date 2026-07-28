import { DomainError } from "./DomainError.js";

export class InvalidTitleError extends DomainError {
    constructor() {
        super("El título del ticket no es válido.")
    }
}

export class InvalidDescriptionError extends DomainError {
    constructor() {
        super("La descripción del ticket no es válida.")
    }
}

export class TicketNotFoundError extends DomainError {
    constructor() {
        super("No se encontró un ticket con el id proporcionado")
    }
}