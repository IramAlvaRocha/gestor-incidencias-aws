import type { CreateCommentUseCase } from "../../../application/use-cases/comment/CreateComment.js";
import type { GetAllCommentsByTicketUseCase } from "../../../application/use-cases/comment/GetAllCommentsByTicket.js";
import { NotAuthorizedToCommentError } from "../../../domain/errors/CommentError.js";
import { DomainError } from "../../../domain/errors/DomainError.js";
import type {Request, Response} from "express"

export class CommentController {

    constructor(
        private readonly createCommentUseCase: CreateCommentUseCase,
        private readonly getAllCommentsByTicketUseCase: GetAllCommentsByTicketUseCase,
    ) {}

    getAll = async(req:Request, res: Response) => {
        try {
            const { id: ticketId } = req.params;
            const comments = await this.getAllCommentsByTicketUseCase.execute({
                ticketId: ticketId as string,
            });
            return res.status(200).json(comments);
        } catch (error) {
            if(error instanceof DomainError)
                return res.status(404).json({ message: error.message });

            console.error(error);

            return res.status(500).json({ message: "Internal server error" });

            
        }
    }

    create = async(req: Request, res: Response) => {
        try {
            const userId = req.authenticatedUser?.userId;
            const { id: ticketId } = req.params;

            const comment = await this.createCommentUseCase.execute({
                ticketId: ticketId as string,
                userId: userId as string,
                content: req.body.content
            });

            return res.status(201).json(comment);

        } catch (error) {
            if(error instanceof NotAuthorizedToCommentError)
                return res.status(403).json({ message: error.message });

            if(error instanceof DomainError)
                return res.status(404).json({ message: error.message });

            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }

    }
}

