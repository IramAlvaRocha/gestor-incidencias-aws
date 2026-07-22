import type { TokenPayload } from "../../../application/ports/ITokenService.ts";

declare global {
    namespace Express {
        interface Request {
            usuarioAutenticado?: TokenPayload;
        }
    }
}