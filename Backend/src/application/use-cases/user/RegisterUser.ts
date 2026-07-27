import bcrypt from "bcryptjs";
import { User } from "../../../domain/entities/user.entity.js";
import { EmailAlreadyRegisteredError } from "../../../domain/errors/UserError.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { randomUUID } from "crypto";
import type { IPasswordHasher } from "../../ports/IPasswordHasher.js";

interface RegisterUserDTO extends Omit<User, "id" | "passwordHash"> {
  password: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(data: RegisterUserDTO): Promise<User> {
    const existingUser = await this.userRepository.getByEmail(data.email);

    if (existingUser) {
      throw new EmailAlreadyRegisteredError(data.email);
    }

    const passwordHash = await this.passwordHasher.hash(data.password);

    const newUser = User.create({
      id: randomUUID(),
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role ?? "Reporter",
      createdAt: new Date(),
    });

    return this.userRepository.save(newUser);
  }
}
