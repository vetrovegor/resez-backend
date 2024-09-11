import { Router } from 'express';
import { body } from 'express-validator';

import { accessTokenMiddleware } from '../middlewares/accessTokenMiddleware';
import { blockedMiddleware } from '../middlewares/blockedMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import promoCodeController from '../controllers/promoCodeController';

export const promoCodeRouter = Router();

promoCodeRouter.post(
    '/',
    accessTokenMiddleware,
    blockedMiddleware,
    body('code').notEmpty(),
    validationMiddleware,
    promoCodeController.activatePromoCode
);
