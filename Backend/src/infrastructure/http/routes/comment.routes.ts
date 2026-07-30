import { Router } from "express";
import type { CommentController } from "../controllers/comment.controller.js";
import type { ITokenService } from "../../../application/ports/ITokenService.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { createCommentSchema } from "../validators/comment.schema.js";

export const createCommentRouter = (
    commentController: CommentController,
    tokenService: ITokenService
):Router => {
 
    //mergeParams is used to merge the params from the parent route with the params from the child route
    const router = Router({mergeParams: true});
    const auth = authenticate(tokenService);

    router.get("/", auth, commentController.getAll)

    router.post("/", auth, validate(createCommentSchema),commentController.create)

    return router;
}