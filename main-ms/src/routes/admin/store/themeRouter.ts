import { Router } from 'express';
import { body, param } from 'express-validator';

import { permissionMiddleware } from '@middlewares/permissionMiddleware';
import { productMiddleware } from '@middlewares/store/productMiddleware';
import { validationMiddleware } from '@middlewares/validationMiddleware';
import themeController from '@controllers/store/themeController';
import { paginationMiddleware } from '@middlewares/paginationMiddleware';
import { Permissions } from 'src/types/permission';

export const themeRouter = Router();

themeRouter.post(
    '/',
    permissionMiddleware(Permissions.CreateProducts),
    body('title').isString().notEmpty(),
    body('price').isFloat({ gt: 0 }).optional(),
    body('requiredSubscriptionId').isNumeric().optional(),
    body('requiredAchievementId').isNumeric().optional(),
    body('seasonStartDate').isISO8601().optional(),
    body('seasonEndDate').isISO8601().optional(),
    body('primary').isHexColor(),
    body('light').isHexColor(),
    body('categories').isArray(),
    body('categories.*').isInt().toInt(),
    validationMiddleware,
    productMiddleware,
    themeController.createTheme
);

themeRouter.get(
    '/',
    permissionMiddleware(Permissions.Store),
    paginationMiddleware,
    themeController.getThemes
);

themeRouter.patch(
    '/:id/toggle-publish',
    permissionMiddleware(Permissions.PublishProducts),
    param('id').isNumeric(),
    validationMiddleware,
    themeController.togglePublishTheme
);

themeRouter.patch(
    '/:id',
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

themeRouter.delete(
    '/:id',
    permissionMiddleware(Permissions.PublishProducts),
    param('id').isNumeric(),
    validationMiddleware,
    themeController.deleteTheme
);
