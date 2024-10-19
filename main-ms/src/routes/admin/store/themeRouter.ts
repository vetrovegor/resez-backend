import { Router } from 'express';
import { body, param } from 'express-validator';

import { accessTokenMiddleware } from '../../../middlewares/accessTokenMiddleware';
import { blockedMiddleware } from '../../../middlewares/blockedMiddleware';
import { permissionMiddleware } from '../../../middlewares/permissionMiddleware';
import { productMiddleware } from '../../../middlewares/store/productMiddleware';
import { validationMiddleware } from '../../../middlewares/validationMiddleware';
import themeController from '../../../controllers/store/themeController';
import { paginationMiddleware } from '../../../middlewares/paginationMiddleware';
import { Permissions } from 'types/permission';

export const themeRouter = Router();

themeRouter.post(
    '/',
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.CreateProducts),
    body('title').isString().notEmpty(),
    body('price').isFloat({ gt: 0 }).optional(),
    body('requiredSubscriptionId').isNumeric().optional(),
    body('requiredAchievementId').isNumeric().optional(),
    body('seasonStartDate').isISO8601().optional(),
    body('seasonEndDate').isISO8601().optional(),
    body('primary').isHexColor(),
    body('light').isHexColor(),
    validationMiddleware,
    productMiddleware,
    themeController.createTheme
);

themeRouter.get(
    '/',
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Store),
    paginationMiddleware,
    themeController.getThemes
);

themeRouter.patch(
    '/:id/toggle-publish',
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.PublishProducts),
    param('id').isNumeric(),
    validationMiddleware,
    themeController.togglePublishTheme
);

themeRouter.patch(
    '/:id',
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.PublishProducts),
    param('id').isNumeric(),
    body('title').isString().notEmpty(),
    body('price').isFloat({ gt: 0 }).optional(),
    body('requiredSubscriptionId').isNumeric().optional(),
    body('requiredAchievementId').isNumeric().optional(),
    body('seasonStartDate').isISO8601().optional(),
    body('seasonEndDate').isISO8601().optional(),
    body('primary').isHexColor(),
    body('light').isHexColor(),
    validationMiddleware,
    productMiddleware,
    themeController.updateTheme
);
