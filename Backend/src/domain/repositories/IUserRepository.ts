import type { User } from "../entities/user.entity.js";

export interface IUserRepository {
    save(user: User): Promise<User>;
    getAll(): Promise<User[]>;
    getByEmail(id: string): Promise<User | null>
}