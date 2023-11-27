import { Router } from "express";
import { param } from "express-validator";

import { paginationMiddleware } from "../middlewares/paginationMiddleware";
import sessionController from "../controllers/sessionController";
import { accessTokenMiddleware } from "../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../middlewares/blockedMiddleware";

export const sessionRouter = Router();

sessionRouter.get(
    '/',
    paginationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    sessionController.getUserSessions
);

sessionRouter.patch(
    '/end/:id',
    param('id').isNumeric(),
    accessTokenMiddleware,
    blockedMiddleware,
    sessionController.endSessionById
);

sessionRouter.patch('/end-all',
    paginationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    sessionController.endAllSessions
);