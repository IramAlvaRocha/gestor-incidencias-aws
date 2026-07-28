import type { User } from "../../../domain/entities/user.entity.js";
import type { RegisterUserUseCase } from "../../../application/use-cases/user/RegisterUser.js";
import type { GetAllUsersUseCase } from "../../../application/use-cases/user/GetAllUsers.js";
import type { Response, Request } from "express";
import { handleControllerError } from "../errors/handleControllerError.js";

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
      return handleControllerError(
        res,
        error,
        "Internal error while registering user",
      );
    }
  };

  getAll = async (_req: Request, res: Response) => {
    const users = await this.getAllUsersUseCase.execute();
    return res.status(200).json(users.map(toUserResponse));
  };
}
