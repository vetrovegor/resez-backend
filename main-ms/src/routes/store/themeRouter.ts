import { Router } from 'express';
import { param } from 'express-validator';

import { accessTokenMiddleware } from '../../middlewares/accessTokenMiddleware';
import { blockedMiddleware } from '../../middlewares/blockedMiddleware';
import { paginationMiddleware } from '../../middlewares/paginationMiddleware';
import { validationMiddleware } from '../../middlewares/validationMiddleware';
import { optionalAuthMiddleware } from '../../middlewares/optionalAuthMiddleware';
import themeController from '../../controllers/store/themeController';

export const themeRouter = Router();

themeRouter.get(
    '/',
    optionalAuthMiddleware,
    paginationMiddleware,
    themeController.getPublishedThemes
);

themeRouter.get(
    '/:id/add',
    accessTokenMiddleware(true),
    param('id').isNumeric(),
    validationMiddleware,
    themeController.addThemeToUser
);
