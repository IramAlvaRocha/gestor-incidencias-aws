import type { NextFunction, Response, Request } from "express";

export const autorize = (...rolesPermitidos: string[]) => 
    (req: Request, res: Response, next: NextFunction) => {

        const usuario = req.usuarioAutenticado;
        
        if( !usuario || !rolesPermitidos.includes(usuario.rol) )
            return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' })

        next();
}