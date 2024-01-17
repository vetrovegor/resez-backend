import { Router } from "express";
import { param } from "express-validator";

import notifyController from "../controllers/notify/notifyController";
import { accessTokenMiddleware } from "../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../middlewares/blockedMiddleware";
import { paginationMiddleware } from "../middlewares/paginationMiddleware";
import { validationMiddleware } from "../middlewares/validationMiddleware";

export const notifyRouter = Router();

notifyRouter.get(
    '/',
    paginationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    notifyController.getUserNotifies
);

notifyRouter.patch(
    '/read/:id',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    notifyController.readNotify
);

notifyRouter.patch(
    '/read-all',
    paginationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    notifyController.readAllNotifies
);