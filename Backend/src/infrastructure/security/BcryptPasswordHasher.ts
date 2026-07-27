import bcrypt from "bcryptjs";
import type { IPasswordHasher } from "../../application/ports/IPasswordHasher.js";

export class BcryptPasswordHasher implements IPasswordHasher {

    private readonly saltRounds = 10;

    hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    compare(plainPassword: string, passwordHash: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, passwordHash);
    }

}