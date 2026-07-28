import { response, type Request, type Response } from "express"
import type { AuthenticateUserUseCase } from "../../../application/use-cases/auth/AuthenticateUser.js"
import { InvalidCredentialsError } from "../../../domain/errors/UserError.js";

export class AuthController {
    constructor(
        private readonly authenticateUser : AuthenticateUserUseCase
    ){

    }

    login = async(req: Request, res: Response) => {
        try {
            const result = await this.authenticateUser.execute(req.body);

            return res.status(200).json(result)

        } catch (error) {
            if( error instanceof InvalidCredentialsError) {
                return res.status(401).json({
                    error: error.message
                })
            }
            return res.status(401).json({
                error: "An error occurred while trying to authenticate"
            })
        }
    }
}

