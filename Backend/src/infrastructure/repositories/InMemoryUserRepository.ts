import type { User } from "../../domain/entities/user.entity.js";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export class InMemoryUserRepository implements IUserRepository {
  
  private usuarios: User[] = [];

  async getUserById(userId: string): Promise<User | null> {
    const user = await this.usuarios.find((u) => u.id === userId);
    return user ?? null;
  }

  async save(user: User): Promise<User> {
    this.usuarios.push(user)
    return user;
  }
  
  async getAll(): Promise<User[]> {
    return this.usuarios;
}
  
  async getByEmail(email: string): Promise<User | null> {
    return this.usuarios.find(u => u.email === email) ?? null;
  }

}
