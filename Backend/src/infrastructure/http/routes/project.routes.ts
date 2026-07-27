import { Router } from "express";
import type { ProjectController } from "../controllers/project.controller.js";
import { autenticate } from "../middlewares/authenticate.js";
import type { ITokenService } from "../../../application/ports/ITokenService.js";
import { validate } from "../middlewares/validate.js";
import { agregarMiembroSchema, crearProjectSchema } from "../validators/project.schema.js";

export const crearProjectRouter = (
    projectController: ProjectController,
    tokenService: ITokenService
):Router => {
    const router = Router();

    router.get(
        "/", 
        autenticate(tokenService),
        projectController.listar
    );
    
    router.post(
        "/", 
        autenticate(tokenService), 
        validate(crearProjectSchema),
        projectController.crear
    );
    
    router.post(
        "/:id/miembros", 
        autenticate(tokenService), 
        validate(agregarMiembroSchema), 
        projectController.agregarMiembroAProyecto
    )

    return router;
}