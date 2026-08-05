import type { Request, Response } from "express";
import type { AuthenticateUserUseCase } from "../../../application/use-cases/auth/AuthenticateUser.js";
import { handleControllerError } from "../errors/handleControllerError.js";
import { cookieOptions } from "../utils/cookieOptions.js";

export class AuthController {
  constructor(private readonly authenticateUser: AuthenticateUserUseCase) {}

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.authenticateUser.execute(req.body);

      res.cookie('token', result.token, {
        ...cookieOptions(),
        maxAge: 60 * 60 * 1000 //1 hora igual que JWT EXPIRES IN
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

  logout = async(_req: Request, res: Response) => {
    res.clearCookie("token", cookieOptions());
    return res.status(200).json({ message: "Sesión cerrada correctamente." });
  };

  me = (req: Request, res: Response) => {
    // req.authenticatedUser lo llena el middleware authenticate
    return res.status(200).json({ user: req.authenticatedUser });
  };

}
