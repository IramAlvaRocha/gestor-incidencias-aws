import type { Role } from "../../../domain/entities/user.entity.js";
import { InvalidCredentialsError } from "../../../domain/errors/UserError.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IPasswordHasher } from "../../ports/IPasswordHasher.js";
import type { ITokenService } from "../../ports/ITokenService.js";

interface AuthenticateUserDTO {
    email: string;
    password: string;
}

interface AuthenticateUserResult {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: Role;
    }
}

export class AuthenticateUserUseCase {
    
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenService: ITokenService
    ){
        
    }

    async execute(data: AuthenticateUserDTO): Promise<AuthenticateUserResult> {
        const user = await this.userRepository.getByEmail(data.email);

        if(!user) throw new InvalidCredentialsError();

        const isPasswordValid = await this.passwordHasher.compare(data.password, user.passwordHash);

        if(!isPasswordValid) throw new InvalidCredentialsError();

        const token = this.tokenService.generate({
            userId: user.id,
            role: user.role
        });

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }

    }
}