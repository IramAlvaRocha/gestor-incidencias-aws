import { DomainError } from "./DomainError.js";

export class TituloInvalidoError extends DomainError {
    constructor() {
        super("El título del ticket no es válido.")
    }
}

export class DescripcionInvalidaError extends DomainError {
    constructor() {
        super("La descripción del ticket no es válida.")
    }
}