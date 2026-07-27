import type { Project } from "../entities/project.entity.js";

export interface IProjectRepository {
    guardar(project: Project): Promise<Project>
    actualizar(project: Project): Promise<Project>
    obtenerTodos(): Promise<Project[]>
    obtenerPorId(id: string): Promise<Project | null>
    buscarPorKey(key: string): Promise<Project | null>;
}