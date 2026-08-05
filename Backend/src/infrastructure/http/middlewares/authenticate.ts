import type { NextFunction, Response, Request } from "express";
import type { ITokenService } from "../../../application/ports/ITokenService.js";


export const authenticate = (tokenService: ITokenService) => 
    (req: Request, res: Response, next: NextFunction) => {
        
        const token = req.cookies.token;
        
        if(!token) {
            return res.status(401).json({ error: "Not authenticated" })
        }

        try {
            const payload = tokenService.verify(token);
            req.authenticatedUser = payload;
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token' }); 
        }
}