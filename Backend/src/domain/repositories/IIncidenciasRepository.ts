import type { Incidencia } from "../entities/Indicencia.js";


export interface IIncidenciasRepository {
    save(incidencia: Incidencia): Promise<Incidencia>;
    getAll(): Promise<Incidencia[]>;    
}