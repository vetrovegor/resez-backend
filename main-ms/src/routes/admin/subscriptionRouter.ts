import { Router } from 'express';
import { body } from 'express-validator';

import { validationMiddleware } from '../../middlewares/validationMiddleware';
import subscriptionController from '../../controllers/subscriptionController';

export const subscriptionRouter = Router();

// сделать проверку чтобы expiredDate было больше текущей
subscriptionRouter.post(
    '/assign',
    // заменить в будущем на subscriptionId и userId
    body('subscriptionId').isNumeric(),
    body('userId').isNumeric(),
    body('expiredDate')
        .isISO8601()
        .withMessage('expiredDate должна быть датой')
        .optional(),
    body('isPermanent')
        .isBoolean()
        .withMessage('isPermanent должен быть булевым'),
    validationMiddleware,
    subscriptionController.assignSubscription
);
