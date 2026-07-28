import { DomainError } from "./DomainError.js";

export class InvalidProjectNameError extends DomainError {
    constructor(){
        super("Project name is not valid.")
    }
}

export class InvalidProjectKeyError extends DomainError {
    constructor(){
        super('Project key must be between 2 and 10 uppercase letters (e.g. PROJ)');
    }
}

export class DuplicateKeyError extends DomainError {
    constructor(key: string) {
        super(`Key "${key}" is already in use by another project`);
    }
}

export class MemberAlreadyExistsError extends DomainError {
  constructor(userId: string) {
    super(`User "${userId}" is already a member of this project`);
  }
}

export class ProjectNotFoundError extends DomainError {
    constructor(
        projectId: string
    ) {
        super(`Project with id ${projectId} was not found`)
    }
}

export class NotAuthorizedError extends DomainError{
    constructor() {
        super("Only the project owner can add members")
    }
} 

export class UserNotFoundError extends DomainError {
    constructor(userId: string) {
        super(`User with id ${userId} was not found`)
    }
}
export class MemberNotInProject extends DomainError {
    constructor() {
        super("You must be a project member to create tickets.")
    }
}
