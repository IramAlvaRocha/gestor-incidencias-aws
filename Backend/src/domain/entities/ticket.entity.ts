import { uuidv4 } from "zod";
import { DescripcionInvalidaError, TituloInvalidoError } from "../errors/TicketError.js";

export type EstadoTicket = "Abierto" | "En Progreso" | "Cerrado";
export type Prioridad = "Baja" | "Media" | "Alta";
export type TipoTicket = "Bug" | "Tarea" | "Historia" | "Mejora"

interface CrearTicketProps {
  key: string;
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoTicket;
  prioridad: Prioridad;
  reporterId: string;
  projectId: string;
  fechaCreacion: Date;
}

export class Ticket {
  private constructor(
    public readonly id: string,
    public readonly key: string,
    public readonly titulo: string,
    public readonly descripcion: string,
    public readonly tipo: TipoTicket,
    public readonly prioridad: Prioridad,
    public estado: EstadoTicket,
    public readonly projectId: string,
    public readonly reporterId: string,
    public assigneeId: string | null,
    public readonly adjuntos: string[],
    public readonly fechaCreacion: Date,
    public fechaActualizacion: Date
  ) {}

  static crear(props: CrearTicketProps): Ticket {
    if(!props.titulo) throw new TituloInvalidoError();
    if(!props.descripcion) throw new DescripcionInvalidaError();

    return new Ticket(
        props.id,
        props.key,
        props.titulo.trim(),
        props.descripcion.trim(),
        props.tipo,
        props.prioridad,
        'Abierto',
        props.projectId,
        props.reporterId,
        null,
        [],
        props.fechaCreacion,
        props.fechaCreacion
      );

    }

    cambiarEstado(nuevoEstado: EstadoTicket): void {
    this.estado = nuevoEstado;
    this.fechaActualizacion = new Date();
  }

  asignarA(userId: string): void {
    this.assigneeId = userId;
    this.fechaActualizacion = new Date();
  }
}