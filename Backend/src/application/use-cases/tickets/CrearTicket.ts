import { randomUUID } from "crypto";
import { Ticket, type Prioridad } from "../../../domain/entities/ticket.entity.js";
import type { ITicketRepository } from "../../../domain/repositories/ITicketRepository.js";

interface CrearTicketDTO { 
    titulo: string;
    descripcion: string;
    prioridad?: Prioridad | undefined;
}


export class CrearTicketUseCase { 
    constructor(
        public readonly repository: ITicketRepository
    ){}

    async execute(datos: CrearTicketDTO): Promise<Ticket> {
        const nuevoTicket = new Ticket(
            randomUUID(),
            datos.titulo,
            datos.descripcion,
            datos.prioridad ?? "Baja",
            "Abierto",
            new Date()
        )

        return this.repository.save(nuevoTicket);
    }

}