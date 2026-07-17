import type { Incidencia } from "../../domain/entities/Indicencia.js";
import type { IIncidenciasRepository } from "../../domain/repositories/IIncidenciasRepository.js";


export class InMemoryIncidenciasRepository implements IIncidenciasRepository
{
    private incidencias: Incidencia[] = [];

    async save(incidencia: Incidencia): Promise<Incidencia> {
        this.incidencias.push(incidencia);
        return incidencia;
    }
    async getAll(): Promise<Incidencia[]> {
        return this.incidencias;
    }
    
}