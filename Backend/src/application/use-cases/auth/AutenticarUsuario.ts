import type { Rol } from "../../../domain/entities/user.entity.js";
import { CredencialesInvalidasError } from "../../../domain/errors/UserError.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IPasswordHasher } from "../../ports/IPasswordHasher.js";
import type { ITokenService } from "../../ports/ITokenService.js";

interface AutenticarUsuarioDTO {
    email: string;
    password: string;
}

interface AutenticarUsuarioResultado {
    token: string;
    usuario: {
        id: string;
        nombre: string;
        email: string;
        rol: Rol;
    }
}

export class AutenticarUsuarioUseCase {
    
    constructor(
        private readonly usuarioRepository: IUserRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenService: ITokenService
    ){
        
    }

    async execute(datos: AutenticarUsuarioDTO): Promise<AutenticarUsuarioResultado> {
        const usuario = await this.usuarioRepository.getByEmail(datos.email);

        if(!usuario) throw new CredencialesInvalidasError();

        const passwordValido = await this.passwordHasher.comparar(datos.password, usuario.passwordHash);

        if(!passwordValido) throw new CredencialesInvalidasError();

        const token = this.tokenService.generar({
            userId: usuario.id,
            rol: usuario.rol
        });

        return {
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        }

    }
}