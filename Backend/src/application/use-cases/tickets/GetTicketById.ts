import type { Ticket } from "../../../domain/entities/ticket.entity.js";
import { TicketNotFoundError } from "../../../domain/errors/TicketError.js";
import type { ITicketRepository } from "../../../domain/repositories/ITicketRepository.js";

export class GetTicketByIdUseCase {
  constructor(private readonly repository: ITicketRepository) {}

  async execute(id: string): Promise<Ticket> {
    const ticket = await this.repository.getById(id);
    if (!ticket) {
      throw new TicketNotFoundError();
    }
    return ticket;
  }
}