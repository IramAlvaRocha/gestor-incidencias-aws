import bcrypt from "bcryptjs";
import { User } from "../../../domain/entities/user.entity.js";
import { EmailYaRegistradoError } from "../../../domain/errors/DomainError.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { randomUUID } from "crypto";

interface RegistrarUsuarioDTO extends Omit<User, "id" | "passwordHash"> {
  password: string;
}

export class RegistrarUsuarioUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(data: RegistrarUsuarioDTO): Promise<User> {
    const usuarioExiste = await this.userRepository.getByEmail(data.email);

    if (usuarioExiste) {
      throw new EmailYaRegistradoError(data.email);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

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
