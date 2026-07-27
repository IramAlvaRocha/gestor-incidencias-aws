import { response, type Request, type Response } from "express"
import type { AutenticarUsuarioUseCase } from "../../../application/use-cases/auth/AutenticarUsuario.js"
import { CredencialesInvalidasError } from "../../../domain/errors/UserError.js";

export class AuthController {
    constructor(
        private readonly autenticarUsuario : AutenticarUsuarioUseCase
    ){

    }

    login = async(req: Request, res: Response) => {
        try {
            const resultado = await this.autenticarUsuario.execute(req.body);

            return res.status(200).json(resultado)

        } catch (error) {
            if( error instanceof CredencialesInvalidasError) {
                return res.status(401).json({
                    error: error.message
                })
            }
            return res.status(401).json({
                error: "Ocurrio un problema al intentar autenticar"
            })
        }
    }
}

