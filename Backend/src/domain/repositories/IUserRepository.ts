import type { User } from "../entities/user.entity.js";

export interface IUserRepository {
    save(user: User): Promise<User>;
    getAll(): Promise<User[]>;
    getByEmail(email: string): Promise<User | null>
}