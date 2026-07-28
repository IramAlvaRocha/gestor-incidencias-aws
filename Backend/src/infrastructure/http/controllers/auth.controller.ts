import type { Request, Response } from "express";
import type { AuthenticateUserUseCase } from "../../../application/use-cases/auth/AuthenticateUser.js";
import { handleControllerError } from "../errors/handleControllerError.js";

export class AuthController {
  constructor(private readonly authenticateUser: AuthenticateUserUseCase) {}

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.authenticateUser.execute(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Internal error while authenticating",
      );
    }
  };
}
