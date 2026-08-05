import type { Project } from "../../../domain/entities/project.entity.js";
import { ProjectNotFoundError } from "../../../domain/errors/ProjectError.js";
import type { IProjectRepository } from "../../../domain/repositories/IProjectRepository.js";


export class GetProjectById {
  constructor(private readonly repository: IProjectRepository) {}

  async execute(id: string): Promise<Project> {
    const project = await this.repository.getById(id);
    if (!project) {
      throw new ProjectNotFoundError(id);
    }
    return project;
  }
}