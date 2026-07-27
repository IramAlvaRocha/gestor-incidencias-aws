import { NoAutorizadoError, ProjectNoEncontradoError, UsuarioNoEncontradoError } from "../../domain/errors/ProjectError.js";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository.js";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

interface AgregarMiembroDTO {
    projectId: string, 
    solicitanteId: string, 
    userId: string
}

export class AgregarMiembroAProject {

    constructor(
        private readonly projectRepository: IProjectRepository,
        private readonly userRepository: IUserRepository
    ){}

    async execute(data: AgregarMiembroDTO) {
        
        const project = await this.projectRepository.obtenerPorId(data.projectId);
        if(!project) throw new ProjectNoEncontradoError(data.projectId);

        if(!project.esOwner(data.solicitanteId)) throw new NoAutorizadoError();

        const existeUsuario = await this.userRepository.getUserById(data.userId)
        
        if(!existeUsuario) throw new UsuarioNoEncontradoError(data.userId);

        project.agregarMiembro(data.userId);

        return this.projectRepository.actualizar(project);
    }

}