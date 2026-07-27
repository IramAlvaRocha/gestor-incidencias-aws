import type { Project } from '../../domain/entities/project.entity.js';
import type { IProjectRepository } from '../../domain/repositories/IProjectRepository.js';


export class InMemoryProjectRepository implements IProjectRepository{

    private projects: Project[] = [];

    async save(project: Project): Promise<Project> {
        this.projects.push(project);
        return project;
    }

    async update(project: Project): Promise<Project> {
        const index = this.projects.findIndex((p) => p.id === project.id);
        
        if (index !== -1) {
            this.projects[index] = project;
        }

        return project;
    }
    async getAll(): Promise<Project[]> {
        return this.projects;
    }
    
    async getById(id: string): Promise<Project | null> {
        const project = this.projects.find(project => project.id === id);
        return project ?? null;
    }

    async findByKey(key: string): Promise<Project | null> {
        const project = this.projects.find((p) => p.key === key)
        return project ?? null;
    }

}