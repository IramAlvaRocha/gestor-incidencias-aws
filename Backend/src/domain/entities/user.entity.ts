import {
  InvalidEmailError,
  InvalidNameError,
} from "../errors/UserError.js";

export type Role = "Admin" | "Developer" | "Reporter";

interface CreateUserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
}

interface ReconstructUserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
}

export class User {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: Role,
    public readonly createdAt: Date,
  ) {}

  static create(props: CreateUserProps): User {

    if (!User.isValidEmail(props.email)) {
      throw new InvalidEmailError(props.email);
    }
    
    if (props.name.trim().length < 2) {
      throw new InvalidNameError();
    }

    return new User(
      props.id,
      props.name.trim(),
      props.email.toLowerCase(),
      props.passwordHash,
      props.role,
      props.createdAt,
    );
  }

  static reconstruct(props: ReconstructUserProps): User {
    return new User(
      props.id,
      props.name.trim(),
      props.email.toLowerCase(),
      props.passwordHash,
      props.role,
      props.createdAt,
    )
  }

  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
