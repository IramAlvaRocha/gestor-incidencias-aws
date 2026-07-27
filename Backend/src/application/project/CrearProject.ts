import { Project } from "../../domain/entities/project.entity.js";
import { KeyProyectoInvalidoError } from "../../domain/errors/ProjectError.js";
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
        
        const projectExiste = await this.repository.buscarPorKey(props.key);

        if(projectExiste) throw new KeyProyectoInvalidoError();

        const nuevoProject = Project.crear({
            id: randomUUID(),
            nombre: props.nombre,
            descripcion: props.descripcion,
            key: props.key,
            ownerId: props.ownerId,
            fechaCreacion: new Date()
        })

        return this.repository.guardar(nuevoProject)
    }
}