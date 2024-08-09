import { Router } from 'express';
import { param } from 'express-validator';

import avatarDecorationController from '../../controllers/store/avatarDecorationController';
import { accessTokenMiddleware } from '../../middlewares/accessTokenMiddleware';
import { blockedMiddleware } from '../../middlewares/blockedMiddleware';
import { paginationMiddleware } from '../../middlewares/paginationMiddleware';
import { validationMiddleware } from '../../middlewares/validationMiddleware';
import { optionalAuthMiddleware } from '../../middlewares/optionalAuthMiddleware';

export const avatarDecorationRouter = Router();

avatarDecorationRouter.get(
    '/',
    optionalAuthMiddleware,
    paginationMiddleware,
    avatarDecorationController.getPublishedAvatarDecorations
);

avatarDecorationRouter.get(
    '/:id/add',
    accessTokenMiddleware,
    blockedMiddleware,
    param('id').isNumeric(),
    validationMiddleware,
    avatarDecorationController.addAvatarDecorationToUser
);
