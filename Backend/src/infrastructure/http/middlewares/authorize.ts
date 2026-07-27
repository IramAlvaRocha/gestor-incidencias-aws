import type { NextFunction, Response, Request } from "express";

export const authorize = (...allowedRoles: string[]) => 
    (req: Request, res: Response, next: NextFunction) => {

        const user = req.authenticatedUser;
        
        if( !user || !allowedRoles.includes(user.role) )
            return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' })

        next();
}