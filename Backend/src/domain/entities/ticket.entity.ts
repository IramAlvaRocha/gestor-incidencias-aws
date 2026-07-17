export type EstadoTicket = "Abierto" | "En Progreso" | "Cerrado";
export type Prioridad = "Baja" | "Media" | "Alta";
export type TipoTicket = "Bug" | "Tarea" | "Historia" | "Mejora"

export class Ticket {
    constructor(
        public readonly id: string,
        public readonly key: string,
        public readonly titulo: string,
        public readonly descripcion: string,
        public readonly tipo: TipoTicket,
        public readonly prioridad: Prioridad,
        public readonly estado: EstadoTicket,
        public readonly projectId: string,
        public readonly reporterId: string,
        public readonly assigneeId: string | null,
        public readonly adjuntos: string[],
        public readonly fechaCreacion: Date,
        public readonly fechaActualizacion: Date
    ){}
}