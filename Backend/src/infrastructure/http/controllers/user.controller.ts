import type { User } from "../../../domain/entities/user.entity.js";
import type { RegisterUserUseCase } from "../../../application/use-cases/user/RegisterUser.js";
import type { GetAllUsersUseCase } from "../../../application/use-cases/user/GetAllUsers.js";
import type { Response, Request } from "express";
import { DomainError } from "../../../domain/errors/DomainError.js";
import { EmailAlreadyRegisteredError } from "../../../domain/errors/UserError.js";

const toUserResponse = (user: User) => ({
  id: user.id,
  name: user.name,
  role: user.role,
  email: user.email,
  createdAt: user.createdAt,
});

export class UserController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
  ) {}

  register = async (req: Request, res: Response) => {
    try {
      const user = await this.registerUserUseCase.execute(req.body);
      return res.status(201).json(toUserResponse(user));
    } catch (error) {
      if (error instanceof EmailAlreadyRegisteredError) {
        return res.status(409).json({ error: error.message });
      }
      if (error instanceof DomainError) {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      return res
        .status(500)
        .json({ error: "Error interno al registrar usuario" });
    }
  };

  getAll = async(req: Request, res: Response) => {
    

    const users = await this.getAllUsersUseCase.execute()

    return res.status(200).json(users.map(toUserResponse))
  }
}
