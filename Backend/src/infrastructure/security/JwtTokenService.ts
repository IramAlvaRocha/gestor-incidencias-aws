import type { ITokenService, TokenPayload } from "../../application/ports/ITokenService.js";

import jwt from "jsonwebtoken"

export class JsonWebTokenService implements ITokenService {
    
    constructor(
        private readonly secret: string,
        private readonly expiresIn: string,
    ){}

    generar(payload: TokenPayload): string {
        return jwt.sign(payload,this.secret, { 
            expiresIn: this.expiresIn
        } as jwt.SignOptions);
    }
    
    verificar(token: string): TokenPayload {
        return jwt.verify(token, this.secret) as TokenPayload;
    }

}