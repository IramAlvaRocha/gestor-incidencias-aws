import {
  EmailInvalidoError,
  NombreInvalidoError,
} from "../errors/UserError.js";

export type Rol = "Admin" | "Developer" | "Reporter";

interface CreateUserProps {
  id: string;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: Rol;
  fechaCreacion: Date;
}

export class User {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly rol: Rol,
    public readonly fechaCreacion: Date,
  ) {}

  // Factory method: única forma de crear un User válido
  static crear(props: CreateUserProps): User {

    if (!User.esEmailValido(props.email)) {
      throw new EmailInvalidoError(props.email);
    }
    
    if (props.nombre.trim().length < 2) {
      throw new NombreInvalidoError();
    }

    return new User(
      props.id,
      props.nombre.trim(),
      props.email.toLowerCase(),
      props.passwordHash,
      props.rol,
      props.fechaCreacion,
    );
  }

  private static esEmailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
