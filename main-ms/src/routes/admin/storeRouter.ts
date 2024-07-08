import { Router } from 'express';
import { body } from 'express-validator';

import avatarDecorationController from '../../controllers/store/avatarDecorationController';
import { fileMiddleware } from '../../middlewares/fileMiddleware';
import { accessTokenMiddleware } from '../../middlewares/accessTokenMiddleware';
import { blockedMiddleware } from '../../middlewares/blockedMiddleware';
import { avatarDecorationMiddleware } from '../../middlewares/store/avatarDecorationMiddleware';
import { permissionMiddleware } from '../../middlewares/permissionMiddleware';
import { Permissions } from 'types/permission';
import { paginationMiddleware } from '../../middlewares/paginationMiddleware';
import { validationMiddleware } from '../../middlewares/validationMiddleware';
import { productMiddleware } from '../../middlewares/store/productMiddleware';

export const storeRouter = Router();

storeRouter.post(
    '/avatar-decoration',
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.CreateProducts),
    body('title').isString().notEmpty(),
    body('options').isJSON().notEmpty(),
    body('price').isFloat({ gt: 0 }).optional(),
    body('seasonStartDate').isISO8601().optional(),
    body('seasonEndDate').isISO8601().optional(),
    body('achievementId').isNumeric().optional(),
    validationMiddleware,
    fileMiddleware(10),
    // проверка даты итд
    productMiddleware,
    avatarDecorationMiddleware,
    avatarDecorationController.createAvatarDecoration
);

storeRouter.get(
    '/avatar-decoration',
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.Store),
    paginationMiddleware,
    avatarDecorationController.getAvatarDecorations
);
