import { NotAuthorizedError, ProjectNotFoundError, UserNotFoundError } from "../../../domain/errors/ProjectError.js";
import type { IProjectRepository } from "../../../domain/repositories/IProjectRepository.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";

interface AddMemberDTO {
    projectId: string, 
    requesterId: string, 
    userId: string
}

export class AddMemberToProject {

    constructor(
        private readonly projectRepository: IProjectRepository,
        private readonly userRepository: IUserRepository
    ){}

    async execute(data: AddMemberDTO) {
        
        const project = await this.projectRepository.getById(data.projectId);
        if(!project) throw new ProjectNotFoundError(data.projectId);

        if(!project.isOwner(data.requesterId)) throw new NotAuthorizedError();

        const existeUsuario = await this.userRepository.getUserById(data.userId)
        
        if(!existeUsuario) throw new UserNotFoundError(data.userId);

        project.addMember(data.userId);

        return this.projectRepository.update(project);
    }

}