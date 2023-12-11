import { Router } from "express";
import { body } from "express-validator";

import roleController from "../../controllers/roleController";

export const roleRouter = Router();

// убрать в будущем
roleRouter.post('/give-full-role',
    body('nickname').notEmpty(),
    roleController.giveFullRoleToUser);