import { InvalidProjectKeyError, MemberAlreadyExistsError, InvalidProjectNameError } from "../errors/ProjectError.js"

interface CreateProjectProps {
    id: string,
    name: string,
    key: string,
    description: string,
    ownerId: string,
    createdAt: Date
}

export class Project {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly key: string,
        public readonly description: string,
        public readonly ownerId: string,
        public readonly members: string[],
        public readonly createdAt: Date, 
    ){
    }

    static create(props: CreateProjectProps): Project {
        if(!props.name) throw new InvalidProjectNameError();
         const normalizedKey = props.key.trim().toUpperCase();

        if (!/^[A-Z]{2,10}$/.test(normalizedKey)) throw new InvalidProjectKeyError();
        
        return new Project(
            props.id,
            props.name,
            normalizedKey,
            props.description,
            props.ownerId,
            [props.ownerId],
            props.createdAt
        )
    }

    isOwner(userId: string): boolean {
        return this.ownerId === userId
    }

    isMember(userId: string): boolean {
        return this.members.includes(userId);
    }

    addMember(userId: string): void {
        if(this.isMember(userId))
            throw new MemberAlreadyExistsError(userId);

        this.members.push(userId)
    }
}