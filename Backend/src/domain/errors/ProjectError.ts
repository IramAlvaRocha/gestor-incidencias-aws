import { DomainError } from "./DomainError.js";

export class NombreProyectoInvalidoError extends DomainError {
    constructor(){
        super("El nombre del proyecto no es válido.")
    }
}

export class KeyProyectoInvalidoError extends DomainError {
    constructor(){
        super('El key del proyecto debe tener entre 2 y 10 letras mayúsculas (ej: PROJ)');
    }
}

export class KeyDuplicadaError extends DomainError {
    constructor(key: string) {
        super(`El key "${key}" ya está en uso en otro proyecto`);
    }
}

export class MiembroYaExisteError extends DomainError {
  constructor(userId: string) {
    super(`El usuario "${userId}" ya es miembro de este proyecto`);
  }
}

export class ProjectNoEncontradoError extends DomainError {
    constructor(
        projectId: string
    ) {
        super(`No se encontro el proyecto con el id ${projectId}`)
    }
}

export class NoAutorizadoError extends DomainError{
    constructor() {
        super("Solo el propietario del proyecto puede agregar miembros")
    }
} 

export class UsuarioNoEncontradoError extends DomainError {
    constructor(userId: string) {
        super(`No se encontro el usuario con el id ${userId}`)
    }
}