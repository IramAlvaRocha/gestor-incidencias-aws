import { randomUUID } from "crypto";
import { Ticket, type Prioridad, type TipoTicket } from "../../../domain/entities/ticket.entity.js";
import type { ITicketRepository } from "../../../domain/repositories/ITicketRepository.js";

interface CrearTicketDTO { 
    titulo: string;
    descripcion: string;
    prioridad?: Prioridad | undefined;
    reporterId: string;
    tipo?: TipoTicket | undefined;
    projectId?: string | undefined;
}


export class CrearTicketUseCase { 
    constructor(
        public readonly repository: ITicketRepository
    ){}

    async execute(datos: CrearTicketDTO): Promise<Ticket> {
        const id = randomUUID();
        const key = `INC-${id.slice(0, 8)}`;
        const now = new Date();

        const nuevoTicket = Ticket.crear({
            id,
            key,
            titulo: datos.titulo,
            descripcion: datos.descripcion,
            tipo: datos.tipo ?? "Tarea",
            prioridad: datos.prioridad ?? "Baja",
            reporterId: datos.reporterId,
            projectId: datos.projectId ?? "default",
            fechaCreacion: now,
        })

        return this.repository.save(nuevoTicket);
    }

}