import type { Ticket } from "../../../domain/entities/ticket.entity.js";
import type { ITicketRepository } from "../../../domain/repositories/ITicketRepository.js";

interface GetTicketsFilters {
  projectId?: string | undefined;
}

export class GetTicketByProjectUseCase {
    constructor(
        private readonly repo: ITicketRepository
    ) {
        
    }

    async execute(filters?: GetTicketsFilters): Promise<Ticket[]> {
        if(filters?.projectId) {
            return this.repo.findByProjectId(filters.projectId);
        }
        return this.repo.getAll();
    }
}