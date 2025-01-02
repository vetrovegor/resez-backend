import { Router } from 'express';
import { query } from 'express-validator';

import liveKitController from '../controllers/liveKitController';
import { validationMiddleware } from '../middlewares/validationMiddleware';

export const liveKitRouter = Router();

liveKitRouter.get(
    '/token',
    query('room').isString(),
    query('username').isString(),
    validationMiddleware,
    liveKitController.getToken
);
