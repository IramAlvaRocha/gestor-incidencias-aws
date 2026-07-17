import type { ITicketRepository } from "../../../domain/repositories/ITicketRepository.js";



export class ObtenerTicketsUseCase { 

    constructor(private readonly repository: ITicketRepository){}

    async execute() {
        return this.repository.getAll();
    }
}