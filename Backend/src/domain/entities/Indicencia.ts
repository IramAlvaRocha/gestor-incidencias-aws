export type Estado = "Abierto" | "En Progreso" | "Cerrado";
export type Prioridad = "Baja" | "Media" | "Alta";

export class Incidencia {
    constructor(
        public readonly id: string,
        public readonly titulo: string,
        public readonly descripcion: string,
        public readonly prioridad: Prioridad,
        public readonly estado: Estado,
        public readonly fechaCreacion: Date
    ){}
}