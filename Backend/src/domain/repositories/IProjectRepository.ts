import type { Project } from "../entities/project.entity.js";

export interface IProjectRepository {
    save(project: Project): Promise<Project>
    update(project: Project): Promise<Project>
    getAll(): Promise<Project[]>
    getById(id: string): Promise<Project | null>
    findByKey(key: string): Promise<Project | null>;
}