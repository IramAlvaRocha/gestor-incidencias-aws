import type { IIncidenciasRepository } from "../../../domain/repositories/IIncidenciasRepository.js";



export class ObtenerIncidencias { 

    constructor(private readonly repository: IIncidenciasRepository){}

    async execute() {
        return this.repository.getAll();
    }
}