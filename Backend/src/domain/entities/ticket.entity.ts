import { InvalidDescriptionError, InvalidTitleError } from "../errors/TicketError.js";

export type TicketStatus = "Open" | "In Progress" | "Closed";
export type Priority = "Low" | "Medium" | "High";
export type TicketType = "Bug" | "Task" | "Story" | "Improvement";

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
    public updatedAt: Date,
  ) {}

  static create(props: CreateTicketProps): Ticket {
    const title = props.title.trim();
    const description = props.description.trim();

    if (title.length < 3) throw new InvalidTitleError();
    if (description.length < 20) throw new InvalidDescriptionError();

    return new Ticket(
      props.id,
      props.key,
      title,
      description,
      props.type,
      props.priority,
      "Open",
      props.projectId,
      props.reporterId,
      null,
      [],
      props.createdAt,
      props.createdAt,
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
