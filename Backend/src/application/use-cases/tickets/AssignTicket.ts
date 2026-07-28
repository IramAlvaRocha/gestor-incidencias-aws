import { MemberNotInProject } from "../../../domain/errors/ProjectError.js";
import { TicketNotFoundError } from "../../../domain/errors/TicketError.js";
import type { IProjectRepository } from "../../../domain/repositories/IProjectRepository.js";
import type { ITicketRepository } from "../../../domain/repositories/ITicketRepository.js";

interface AssignTicketDTO {
    ticketId: string,
    assigneeId: string
}

export class AssignTicketUseCase {
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(data: AssignTicketDTO) {

    const ticket = await this.ticketRepository.getById(data.ticketId);

    if(!ticket) throw new TicketNotFoundError();

    const project = await this.projectRepository.getById(ticket.projectId);

    if(!project || !project.isMember(data.assigneeId)) throw new MemberNotInProject();

    ticket.assignTo(data.assigneeId);

    return this.ticketRepository.update(ticket); 

  }
}
