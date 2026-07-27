import { KeyProyectoInvalidoError, MiembroYaExisteError, NombreProyectoInvalidoError } from "../errors/ProjectError.js"

interface CrearProjectProps {
    id: string,
    nombre: string,
    key: string,
    descripcion: string,
    ownerId: string,
    fechaCreacion: Date
}

export class Project {
    constructor(
        public readonly id: string,
        public readonly nombre: string,
        public readonly key: string,
        public readonly descripcion: string,
        public readonly ownerId: string,
        public readonly miembros: string[],
        public readonly fechaCreacion: Date, 
    ){
    }

    static crear(props: CrearProjectProps): Project {
        if(!props.nombre) throw new NombreProyectoInvalidoError();
         const keyNormalizado = props.key.trim().toUpperCase();

        if (!/^[A-Z]{2,10}$/.test(keyNormalizado)) throw new KeyProyectoInvalidoError();
        
        return new Project(
            props.id,
            props.nombre,
            keyNormalizado,
            props.descripcion,
            props.ownerId,
            [props.ownerId],
            props.fechaCreacion
        )
    }

    esOwner(userId: string): boolean {
        return this.ownerId === userId
    }

    esMiembro(userId: string): boolean {
        return this.miembros.includes(userId);
    }

    agregarMiembro(userId: string): void {
        if(this.esMiembro(userId))
            throw new MiembroYaExisteError(userId);

        this.miembros.push(userId)
    }
}