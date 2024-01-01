import { Router } from "express";
import { body } from "express-validator";

import roleController from "../../controllers/roleController";
import { validationMiddleware } from "../../middlewares/validationMiddleware";

export const roleRouter = Router();

// убрать в будущем
roleRouter.post('/give-full-role',
    body('nickname').notEmpty(),
    validationMiddleware,
    roleController.giveFullRoleToUser);