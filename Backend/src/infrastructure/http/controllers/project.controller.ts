import { CreateProjectUseCase } from '../../../application/project/CreateProject.js';
import type {Response, Request} from "express"
import { DuplicateKeyError, InvalidProjectKeyError, NotAuthorizedError, ProjectNotFoundError, UserNotFoundError } from '../../../domain/errors/ProjectError.js';
import { DomainError } from '../../../domain/errors/DomainError.js';
import type { GetAllProjectsUseCase } from '../../../application/project/GetAllProjects.js';
import type { AddMemberToProject } from '../../../application/project/AddMemberToProject.js';
export class ProjectController {
    constructor(
        private readonly createProject: CreateProjectUseCase,
        private readonly getAllProjects: GetAllProjectsUseCase,
        private readonly addMemberToProjectUseCase: AddMemberToProject,
    ){}

    create = async(req: Request, res: Response) => {
        try {
            const ownerId = req.authenticatedUser?.userId;

            if (!ownerId) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }

            const project = await this.createProject.execute({
                ...req.body,
                ownerId,
            });

            return res.status(201).json(project);

        } catch (error) {
            
            if(error instanceof DuplicateKeyError)
                return res.status(409).json({ error: error.message })

            if(error instanceof InvalidProjectKeyError) 
                return res.status(400).json({error: error.message})

            if(error instanceof DomainError)
                return res.status(409).json({
                    error: error.message
            })

            console.log(error)

            return res.status(500).json({
                error: "Error interno al crear un proyecto"
            })

        }
    }

    getAll = async (_req: Request, res: Response) => {
    const projects = await this.getAllProjects.execute();
    return res.status(200).json(projects);
  };

  addMemberToProject = async (req: Request, res: Response) => {
    try {
      const requesterId = req.authenticatedUser!.userId;
      const { id: projectId } = req.params;

      const project = await this.addMemberToProjectUseCase.execute({
        projectId: projectId as string,
        userId: req.body.userId,
        requesterId,
      });

      return res.status(200).json(project);
    } catch (error) {
      if (error instanceof NotAuthorizedError) {
        return res.status(403).json({ error: error.message });
      }
      if (error instanceof ProjectNotFoundError || error instanceof UserNotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof DomainError) {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: 'Error interno al agregar miembro' });
    }
  };

}