import type { User } from "../../../domain/entities/user.entity.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";


export class ListarUsuariosUseCase {
    constructor(public readonly userRepository: IUserRepository){}

    async execute(): Promise<User[]> {
        return this.userRepository.getAll();
    }
}