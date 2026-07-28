import { DomainError } from "./DomainError.js";

export class InvalidEmailError extends DomainError {
    constructor(email: string){
        super(`Email ${email} does not have a valid format`);
    }
}

export class InvalidNameError extends DomainError {
    constructor(){
        super(`Name must be at least two characters long`);
    }
}

export class EmailAlreadyRegisteredError extends DomainError {
  constructor(email: string) {
    super(`Email "${email}" is already registered`);
  }
}

export class InvalidCredentialsError extends DomainError {
    constructor(
    ){
        super('Incorrect email or password.')
    }
}
