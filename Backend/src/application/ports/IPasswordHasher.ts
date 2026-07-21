export interface IPasswordHasher {
    hash(password: string): Promise<string>;
    comparar(passwordPlano: string, passwordHash: string) : Promise<boolean> 
}