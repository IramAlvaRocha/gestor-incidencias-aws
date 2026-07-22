import type { NextFunction, Response, Request } from "express";
import type { ITokenService } from "../../../application/ports/ITokenService.js";


export const autenticate = (tokenService: ITokenService) => 
    (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401)
        }

        const token = authHeader.split(" ")[1];

        try {
            const payload = tokenService.verificar(token as string);
            req.usuarioAutenticado = payload;
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Token inválido o expirado' }); 
        }
}