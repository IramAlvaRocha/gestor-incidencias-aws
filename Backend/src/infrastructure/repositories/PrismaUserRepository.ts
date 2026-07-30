import { User, type Role } from "../../domain/entities/user.entity.js";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import type {
  PrismaClient,
  User as PrismaUser,
} from "../../generated/prisma/client.js";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<User> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        CreatedAt: user.createdAt,
      },
    });
    return user;
  }

  async getAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.toDomain(user));
  }

  async getByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    return user ? this.toDomain(user) : null;
  }

  async getUserById(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({ where: { id: userId } });
    return user ? this.toDomain(user) : null;
  }

  private toDomain(row: PrismaUser): User {
    return User.reconstruct({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role as Role,
      createdAt: row.CreatedAt,
    });
  }
}
