import { CrearProjectUseCase } from '../../../application/project/CrearProject.js';
import type {Response, Request} from "express"
import { KeyDuplicadaError, KeyProyectoInvalidoError, NoAutorizadoError, ProjectNoEncontradoError, UsuarioNoEncontradoError } from '../../../domain/errors/ProjectError.js';
import { DomainError } from '../../../domain/errors/DomainError.js';
import type { ListarProjectsUseCase } from '../../../application/project/ListarProjects.js';
import type { AgregarMiembroAProject } from '../../../application/project/AgregarMiembroAProject.js';
export class ProjectController {
    constructor(
        private readonly crearProject: CrearProjectUseCase,
        private readonly listarProjects: ListarProjectsUseCase,
        private readonly agregarMiembro: AgregarMiembroAProject,
    ){}

    crear = async(req: Request, res: Response) => {
        try {
            const ownerId = req.usuarioAutenticado?.userId;

            if (!ownerId) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }

            const project = await this.crearProject.execute({
                ...req.body,
                ownerId,
            });

            return res.status(201).json(project);

        } catch (error) {
            
            if(error instanceof KeyDuplicadaError)
                return res.status(409).json({ error: error.message })

            if(error instanceof KeyProyectoInvalidoError) 
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

    listar = async (_req: Request, res: Response) => {
    const projects = await this.listarProjects.execute();
    return res.status(200).json(projects);
  };

  agregarMiembroAProyecto = async (req: Request, res: Response) => {
    try {
      const solicitanteId = req.usuarioAutenticado!.userId;
      const { id: projectId } = req.params;

      const project = await this.agregarMiembro.execute({
        projectId: projectId as string,
        userId: req.body.userId,
        solicitanteId,
      });

      return res.status(200).json(project);
    } catch (error) {
      if (error instanceof NoAutorizadoError) {
        return res.status(403).json({ error: error.message });
      }
      if (error instanceof ProjectNoEncontradoError || error instanceof UsuarioNoEncontradoError) {
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