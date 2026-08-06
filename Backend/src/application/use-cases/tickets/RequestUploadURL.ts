import { randomUUID } from "node:crypto";
import { ALLOWED_CONTENT_TYPES, InvalidFileTypeError, TicketNotFoundError } from "../../../domain/errors/TicketError.js";
import type { ITicketRepository } from "../../../domain/repositories/ITicketRepository.js";
import type { IStorageService } from "../../ports/IStorageService.js";

interface RequestURLUploadDTO {
    ticketId: string;
    fileName: string;
    contentType: string;
}

export class RequestUploadURLUseCase {
    constructor(
        private readonly ticketRepository: ITicketRepository,
        private readonly storageService: IStorageService
    ) {}

    async execute(data: RequestURLUploadDTO) {
        const ticket = await this.ticketRepository.getById(data.ticketId);
        
        if(!ticket)
            throw new TicketNotFoundError();

        if(!ALLOWED_CONTENT_TYPES.includes(data.contentType))
            throw new InvalidFileTypeError();

        const sanitizedFileName = data.fileName.replace(/\s+/g, '-');
        const key = `tickets/${data.ticketId}/${randomUUID()}-${sanitizedFileName}`;

        const uploadURL = await this.storageService.getUploadUrl(key, data.contentType);

        return { uploadURL, key }

    }
}