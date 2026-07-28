import { Router } from "express";
import type { ProjectController } from "../controllers/project.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import type { ITokenService } from "../../../application/ports/ITokenService.js";
import { validate } from "../middlewares/validate.js";
import { addMemberSchema, createProjectSchema } from "../validators/project.schema.js";

export const createProjectRouter = (
    projectController: ProjectController,
    tokenService: ITokenService
):Router => {
    const router = Router();

    router.get(
        "/", 
        authenticate(tokenService),
        projectController.getAll
    );
    
    router.post(
        "/", 
        authenticate(tokenService), 
        validate(createProjectSchema),
        projectController.create
    );
    
    router.post(
        "/:id/members", 
        authenticate(tokenService), 
        validate(addMemberSchema), 
        projectController.addMemberToProject
    )

    return router;
}