import bcrypt from "bcryptjs";
import { User } from "../../../domain/entities/user.entity.js";
import { EmailYaRegistradoError } from "../../../domain/errors/UserError.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { randomUUID } from "crypto";
import type { IPasswordHasher } from "../../ports/IPasswordHasher.js";

interface RegistrarUsuarioDTO extends Omit<User, "id" | "passwordHash"> {
  password: string;
}

export class RegistrarUsuarioUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(data: RegistrarUsuarioDTO): Promise<User> {
    const usuarioExiste = await this.userRepository.getByEmail(data.email);

    if (usuarioExiste) {
      throw new EmailYaRegistradoError(data.email);
    }

    const passwordHash = await this.passwordHasher.hash(data.password);

    const nuevoUsuario = User.crear({
      id: randomUUID(),
      nombre: data.nombre,
      email: data.email,
      passwordHash,
      rol: data.rol ?? "Reporter",
      fechaCreacion: new Date(),
    });

    return this.userRepository.save(nuevoUsuario);
  }
}
