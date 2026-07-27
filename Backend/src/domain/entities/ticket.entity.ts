import { InvalidDescriptionError, InvalidTitleError } from "../errors/TicketError.js";

export type TicketStatus = "Abierto" | "En Progreso" | "Cerrado";
export type Priority = "Baja" | "Media" | "Alta";
export type TicketType = "Bug" | "Tarea" | "Historia" | "Mejora"

interface CreateTicketProps {
  id: string;
  key: string;
  title: string;
  description: string;
  type: TicketType;
  priority: Priority;
  reporterId: string;
  projectId: string;
  createdAt: Date;
}

export class Ticket {
  private constructor(
    public readonly id: string,
    public readonly key: string,
    public readonly title: string,
    public readonly description: string,
    public readonly type: TicketType,
    public readonly priority: Priority,
    public status: TicketStatus,
    public readonly projectId: string,
    public readonly reporterId: string,
    public assigneeId: string | null,
    public readonly attachments: string[],
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(props: CreateTicketProps): Ticket {
    if(!props.title) throw new InvalidTitleError();
    if(!props.description) throw new InvalidDescriptionError();

    return new Ticket(
        props.id,
        props.key,
        props.title.trim(),
        props.description.trim(),
        props.type,
        props.priority,
        'Abierto',
        props.projectId,
        props.reporterId,
        null,
        [],
        props.createdAt,
        props.createdAt
      );

    }

    changeStatus(newStatus: TicketStatus): void {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  assignTo(userId: string): void {
    this.assigneeId = userId;
    this.updatedAt = new Date();
  }
}