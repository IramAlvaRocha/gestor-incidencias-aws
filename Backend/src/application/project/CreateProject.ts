import { Project } from "../../domain/entities/project.entity.js";
import { DuplicateKeyError, InvalidProjectKeyError } from "../../domain/errors/ProjectError.js";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository.js";
import { randomUUID } from "crypto";

interface CreateProjectDTO {
    name: string,
    description: string,
    key: string,
    ownerId: string
}

export class CreateProjectUseCase {
    constructor(
        private readonly repository: IProjectRepository
    ){}

    async execute(props: CreateProjectDTO): Promise<Project> {
        const normalizedKey = props.key.trim().toUpperCase();
        
        const existingProject = await this.repository.findByKey(normalizedKey);

        if(existingProject) throw new DuplicateKeyError(normalizedKey);

        const newProject = Project.create({
            id: randomUUID(),
            name: props.name,
            description: props.description,
            key: normalizedKey,
            ownerId: props.ownerId,
            createdAt: new Date()
        })

        return this.repository.save(newProject)
    }
}