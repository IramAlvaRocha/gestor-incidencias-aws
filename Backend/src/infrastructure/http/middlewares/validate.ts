import type { NextFunction, Response, Request } from "express";
import type { ZodSchema } from "zod/v4";


export const validate = (schema: ZodSchema) => 
(req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if(!result.success)
        return res.status(400).json({ errors: result.error.flatten().fieldErrors });

    req.body = result.data;

    next();
}