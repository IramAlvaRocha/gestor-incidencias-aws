import type { CreateProjectUseCase } from "../../../application/use-cases/project/CreateProject.js";
import type { Response, Request } from "express";
import type { GetAllProjectsUseCase } from "../../../application/use-cases/project/GetAllProjects.js";
import type { AddMemberToProject } from "../../../application/use-cases/project/AddMemberToProject.js";
import { handleControllerError } from "../errors/handleControllerError.js";

export class ProjectController {
  constructor(
    private readonly createProject: CreateProjectUseCase,
    private readonly getAllProjects: GetAllProjectsUseCase,
    private readonly addMemberToProjectUseCase: AddMemberToProject,
  ) {}

  create = async (req: Request, res: Response) => {
    try {
      const ownerId = req.authenticatedUser?.userId;

      if (!ownerId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const project = await this.createProject.execute({
        ...req.body,
        ownerId,
      });

      return res.status(201).json(project);
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Internal error while creating a project",
      );
    }
  };

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
      return handleControllerError(
        res,
        error,
        "Internal error while adding member",
      );
    }
  };
}
