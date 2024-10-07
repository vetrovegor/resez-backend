import { Router } from "express";
import { param, query } from "express-validator";

import notifyController from "../controllers/notify/notifyController";
import { accessTokenMiddleware } from "../middlewares/accessTokenMiddleware";
import { paginationMiddleware } from "../middlewares/paginationMiddleware";
import { validationMiddleware } from "../middlewares/validationMiddleware";

export const notifyRouter = Router();

notifyRouter.get(
    '/unread-count',
    accessTokenMiddleware(true),
    notifyController.getUserUnreadNotifiesCount
);

notifyRouter.get(
    '/',
    query('unread').isBoolean().optional(),
    validationMiddleware,
    paginationMiddleware,
    accessTokenMiddleware(true),
    notifyController.getUserNotifies
);

notifyRouter.patch(
    '/read/:id',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    notifyController.readNotify
);

notifyRouter.patch(
    '/read-all',
    paginationMiddleware,
    accessTokenMiddleware(true),
    notifyController.readAllNotifies
);