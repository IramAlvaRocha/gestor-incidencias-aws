import type { Project } from "../../domain/entities/project.entity.js";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository.js";

export class GetAllProjectsUseCase {
    constructor(
        private readonly repository: IProjectRepository
    ){}

    async execute(): Promise<Project[]> {
        return this.repository.getAll();
    }
}