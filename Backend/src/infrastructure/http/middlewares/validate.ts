import type { NextFunction, Response, Request } from "express";
import type { ZodSchema } from "zod/v4";


export const validate = (schema: ZodSchema) => 
(req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.body);

    if(!resultado.success)
        return res.status(400).json({ errores: resultado.error.flatten().fieldErrors });

    req.body = resultado.data;

    next();
}