export interface TokenPayload {
  userId: string;
  rol: string;
}

export interface ITokenService {
  generar(payload: TokenPayload): string;
  verificar(token: string): TokenPayload;
}