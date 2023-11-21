import { Router } from "express";
import { param } from "express-validator";

import { paginationMiddleware } from "../middlewares/paginationMiddleware";
import sessionController from "../controllers/sessionController";
import { accessTokenMiddleware } from "../middlewares/accessTokenMiddleware";

export const sessionRouter = Router();

sessionRouter.get(
    '/',
    paginationMiddleware,
    accessTokenMiddleware,
    sessionController.getUserSessions
);

sessionRouter.patch(
    '/end/:id',
    param('id').isNumeric(),
    accessTokenMiddleware,
    sessionController.endSessionById
);

sessionRouter.patch('/end-all',
    paginationMiddleware,
    accessTokenMiddleware,
    sessionController.endAllSessions);