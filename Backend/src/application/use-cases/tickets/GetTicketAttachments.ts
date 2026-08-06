import { TicketNotFoundError } from "../../../domain/errors/TicketError.js";
import type { ITicketRepository } from "../../../domain/repositories/ITicketRepository.js";
import type { IStorageService } from "../../ports/IStorageService.js";

export class GetTicketAttachmentsUseCase {
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly storageService: IStorageService,
  ) {}

  async execute(ticketId: string) {
    const ticket = await this.ticketRepository.getById(ticketId);

    if (!ticket) throw new TicketNotFoundError();

    return Promise.all(ticket.attachments.map(async (key) => ({
        key,
        url: await this.storageService.getDownloadUrl(key),
    })));
  }
}
