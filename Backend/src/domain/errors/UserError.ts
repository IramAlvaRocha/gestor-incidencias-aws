import { DomainError } from "./DomainError.js";

export class InvalidEmailError extends DomainError {
    constructor(email: string){
        super(`El email ${email} no tiene un formato válido`);
    }
}

export class InvalidNameError extends DomainError {
    constructor(){
        super(`El nombre debe tener al menos dos caracteres`);
    }
}

export class EmailAlreadyRegisteredError extends DomainError {
  constructor(email: string) {
    super(`El email "${email}" ya está registrado`);
  }
}

export class InvalidCredentialsError extends DomainError {
    constructor(
    ){
        super('Email o contraseña incorrectos.')
    }
}
