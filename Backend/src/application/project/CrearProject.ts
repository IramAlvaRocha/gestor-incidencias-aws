import { Project } from "../../domain/entities/project.entity.js";
import { KeyDuplicadaError, KeyProyectoInvalidoError } from "../../domain/errors/ProjectError.js";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository.js";
import { randomUUID } from "crypto";

interface CrearProjectDTO {
    nombre: string,
    descripcion: string,
    key: string,
    ownerId: string
}

export class CrearProjectUseCase {
    constructor(
        private readonly repository: IProjectRepository
    ){}

    async execute(props: CrearProjectDTO): Promise<Project> {
        const keyNormalizada = props.key.trim().toUpperCase();
        
        const projectExiste = await this.repository.buscarPorKey(keyNormalizada);

        if(projectExiste) throw new KeyDuplicadaError(keyNormalizada);

        const nuevoProject = Project.crear({
            id: randomUUID(),
            nombre: props.nombre,
            descripcion: props.descripcion,
            key: keyNormalizada,
            ownerId: props.ownerId,
            fechaCreacion: new Date()
        })

        return this.repository.guardar(nuevoProject)
    }
}