import { DomainError } from "./DomainError.js";

export class EmailInvalidoError extends DomainError {
    constructor(email: string){
        super(`El email ${email} no tiene un formato válido`);
    }
}

export class NombreInvalidoError extends DomainError {
    constructor(){
        super(`El nombre debe tener al menos dos caracteres`);
    }
}

export class EmailYaRegistradoError extends DomainError {
  constructor(email: string) {
    super(`El email "${email}" ya está registrado`);
  }
}

export class CredencialesInvalidasError extends DomainError {
    constructor(
    ){
        super('Email o contraseña incorrectos.')
    }
}
