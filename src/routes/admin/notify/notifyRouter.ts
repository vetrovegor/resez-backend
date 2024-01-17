import { Router } from "express";
import { body } from "express-validator";

import notifyController from "../../../controllers/notify/notifyController";
import { accessTokenMiddleware } from "../../../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../../../middlewares/blockedMiddleware";
import { permissionMiddleware } from "../../../middlewares/permissionMiddleware";
import { validationMiddleware } from "../../../middlewares/validationMiddleware";
import { notifyBodyMiddleware } from "../../../middlewares/notifyBodyMiddleware";
import { Permissions } from "../../../types/permission";

export const notifyRouter = Router();

notifyRouter.post(
    '/',
    body('notifyTypeId').optional().isNumeric(),
    body('title').notEmpty().isLength({ max: 100 }),
    body('content').notEmpty(),
    body('author').isLength({ max: 30 }),
    body('users').isArray(),
    body('date').optional().isISO8601(),
    validationMiddleware,
    notifyBodyMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.Notifies),
    notifyController.sendNotifies
);