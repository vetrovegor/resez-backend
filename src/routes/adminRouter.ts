import { Router } from "express";
import { body } from "express-validator";

import roleController from "../controllers/roleController";

export const adminRouter = Router();

// убрать в будущем
adminRouter.post('/role/give-full-role',
    body('nickname').notEmpty(),
    roleController.giveFullRoleToUser);