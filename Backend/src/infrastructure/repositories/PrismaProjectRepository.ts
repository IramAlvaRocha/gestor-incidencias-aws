import { Project } from "../../domain/entities/project.entity.js";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository.js";
import type { PrismaClient } from "../../generated/prisma/client.js";

type ProjectRow = {
  id: string; 
  name: string; 
  key: string; 
  description: string | null;
  ownerId: string; 
  createdAt: Date; 
  members: { userId: string }[];
};

export class PrismaProjectRepository implements IProjectRepository {
    
    constructor(
        private readonly prisma: PrismaClient
    ) {
        
    }
    
    async save(project: Project): Promise<Project> {
        await this.prisma.project.create({
            data: {
                id: project.id,
                name: project.name,
                key: project.key,
                description: project.description,
                ownerId: project.ownerId,
                createdAt: project.createdAt,
                members: { create: project.members.map((userId) => ({userId}))}
            }
        })

        return project;
    }

    async update(project: Project): Promise<Project> {
        await this.prisma.projectMember.createMany({
            data: project.members.map((userId) => ({ projectId: project.id, userId })),
            skipDuplicates: true,
        }); 
        
        return project;
    }
    
    async getAll(): Promise<Project[]> {
        const projects = await this.prisma.project.findMany({ include: { members: true } });
        return projects.map(this.toDomain);
    }

    async getById(id: string): Promise<Project | null> {
        const project = await this.prisma.project.findUnique({ where: { id }, include: { members: true } });
        return project ? this.toDomain(project) : null;
    }

    async findByKey(key: string): Promise<Project | null> {
        const project = await this.prisma.project.findUnique({ where: { key }, include: { members: true } });
        return project ? this.toDomain(project) : null;
    }
 
     private toDomain(row: ProjectRow): Project {
        return Project.reconstruct({
            id: row.id,
            name: row.name,
            key: row.key,
            description: row.description ?? "",
            ownerId: row.ownerId,
            members: row.members.map((m) => m.userId),
            createdAt: row.createdAt,
        });
  }
}