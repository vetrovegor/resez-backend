import { Router } from 'express';
import { body, param } from 'express-validator';

import avatarDecorationController from '../../../controllers/store/avatarDecorationController';
import { fileMiddleware } from '../../../middlewares/fileMiddleware';
import { accessTokenMiddleware } from '../../../middlewares/accessTokenMiddleware';
import { blockedMiddleware } from '../../../middlewares/blockedMiddleware';
import { avatarDecorationMiddleware } from '../../../middlewares/store/avatarDecorationMiddleware';
import { permissionMiddleware } from '../../../middlewares/permissionMiddleware';
import { Permissions } from 'types/permission';
import { paginationMiddleware } from '../../../middlewares/paginationMiddleware';
import { validationMiddleware } from '../../../middlewares/validationMiddleware';
import { productMiddleware } from '../../../middlewares/store/productMiddleware';

export const avatarDecorationRouter = Router();

avatarDecorationRouter.post(
    '/',
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.CreateProducts),
    body('title').isString().notEmpty(),
    body('price').isFloat({ gt: 0 }).optional(),
    body('requiredSubscriptionId').isNumeric().optional(),
    body('achievementId').isNumeric().optional(),
    body('seasonStartDate').isISO8601().optional(),
    body('seasonEndDate').isISO8601().optional(),
    body('options').isJSON().notEmpty(),
    validationMiddleware,
    fileMiddleware(10),
    productMiddleware,
    avatarDecorationMiddleware,
    avatarDecorationController.createAvatarDecoration
);

avatarDecorationRouter.get(
    '/',
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Store),
    paginationMiddleware,
    avatarDecorationController.getAvatarDecorations
);

avatarDecorationRouter.patch(
    '/:id/toggle-publish',
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.PublishProducts),
    param('id').isNumeric(),
    validationMiddleware,
    avatarDecorationController.togglePublishAvatarDecoration
);
