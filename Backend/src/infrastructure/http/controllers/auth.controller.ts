import type { Request, Response } from "express";
import type { AuthenticateUserUseCase } from "../../../application/use-cases/auth/AuthenticateUser.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { handleControllerError } from "../errors/handleControllerError.js";
import { cookieOptions } from "../utils/cookieOptions.js";

export class AuthController {
  constructor(
    private readonly authenticateUser: AuthenticateUserUseCase,
    private readonly userRepository: IUserRepository,
  ) {}

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.authenticateUser.execute(req.body);

      res.cookie("token", result.token, {
        ...cookieOptions(),
        maxAge: 60 * 60 * 1000, //1 hora igual que JWT EXPIRES IN
      });

      return res.status(200).json(result.user);
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Internal error while authenticating",
      );
    }
  };

  logout = async (_req: Request, res: Response) => {
    res.clearCookie("token", cookieOptions());
    return res.status(200).json({ message: "Sesión cerrada correctamente." });
  };

  me = async (req: Request, res: Response) => {
    try {
      const userId = req.authenticatedUser?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      return res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      return handleControllerError(
        res,
        error,
        "Internal error while fetching session",
      );
    }
  };
}
