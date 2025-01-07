import { Router } from 'express';
import { body, param } from 'express-validator';

import feedbackController from '@controllers/feedbackController';
import { accessTokenMiddleware } from '@middlewares/accessTokenMiddleware';
import { permissionMiddleware } from '@middlewares/permissionMiddleware';
import { paginationMiddleware } from '@middlewares/paginationMiddleware';
import { validationMiddleware } from '@middlewares/validationMiddleware';
import { Permissions } from 'src/types/permission';

export const feedbackRouter = Router();

feedbackRouter.get(
    '/',
    body('text').isString(),
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Complaints),
    paginationMiddleware,
    feedbackController.getFeedback
);

feedbackRouter.patch(
    '/:id/read',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Complaints),
    paginationMiddleware,
    feedbackController.readFeedback
);
