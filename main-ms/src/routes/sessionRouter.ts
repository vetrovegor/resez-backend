import { Router } from 'express';
import { param } from 'express-validator';

import { paginationMiddleware } from '@middlewares/paginationMiddleware';
import sessionController from '@controllers/sessionController';
import { accessTokenMiddleware } from '@middlewares/accessTokenMiddleware';
import { validationMiddleware } from '@middlewares/validationMiddleware';

export const sessionRouter = Router();

sessionRouter.get(
    '/',
    paginationMiddleware,
    accessTokenMiddleware(true),
    sessionController.getUserSessions
);

sessionRouter.patch(
    '/end/:id',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    sessionController.endSessionById
);

sessionRouter.patch(
    '/end-all',
    paginationMiddleware,
    accessTokenMiddleware(true),
    sessionController.endAllSessions
);
