import { InvalidCommentError } from "../errors/CommentError.js";

interface CreateCommentProps {
    id: string;
    ticketId: string;
    userId: string;
    content: string;
    createdAt: Date;
}

interface ReconstructCommentProps {
    id: string;
    ticketId: string;
    userId: string;
    content: string;
    createdAt: Date;
}

export class Comment {
    private constructor(
        public readonly id: string,
        public readonly ticketId: string,
        public readonly userId: string,
        public readonly content: string,
        public readonly createdAt: Date,
    ){}

    static create(props: CreateCommentProps): Comment {

        if(!props.content.trim()) throw new InvalidCommentError();

        return new Comment(
            props.id,
            props.ticketId,
            props.userId,
            props.content,
            props.createdAt,
        );
    }

    static reconstruct(props: ReconstructCommentProps): Comment {
        return new Comment(
            props.id,
            props.ticketId,
            props.userId,
            props.content,
            props.createdAt,
        );
    }
}