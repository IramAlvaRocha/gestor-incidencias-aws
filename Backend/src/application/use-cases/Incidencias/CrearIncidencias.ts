import { randomUUID } from "crypto";
import { Incidencia, type Prioridad } from "../../../domain/entities/Indicencia.js";
import type { IIncidenciasRepository } from "../../../domain/repositories/IIncidenciasRepository.js";

interface CrearIncidenciaDTO { 
    titulo: string;
    descripcion: string;
    prioridad?: Prioridad | undefined;
}


export class CrearIncidencia { 
    constructor(
        public readonly repository: IIncidenciasRepository
    ){}

    async execute(datos: CrearIncidenciaDTO): Promise<Incidencia> {
        const nuevaIncidencia = new Incidencia(
            randomUUID(),
            datos.titulo,
            datos.descripcion,
            datos.prioridad ?? "Baja",
            "Abierto",
            new Date()
        )

        return this.repository.save(nuevaIncidencia);
    }

}