import { Router } from 'express';
import { body, param, query } from 'express-validator';

import { permissionMiddleware } from '@middlewares/permissionMiddleware';
import promoCodeController from '@controllers/promoCodeController';
import { validationMiddleware } from '@middlewares/validationMiddleware';
import { paginationMiddleware } from '@middlewares/paginationMiddleware';
import { Permissions } from 'src/types/permission';

export const promoCodeRouter = Router();

promoCodeRouter.post(
    '/',
    permissionMiddleware(Permissions.PromoCodes),
    body('code')
        .notEmpty()
        .matches(/^[a-zA-Z0-9-]{3,20}$/)
        .withMessage(
            'Промокод должен быть от 3 до 20 символов и содержать только буквы, цифры или дефис.'
        ),
    body('expiredDate').optional().isISO8601(),
    body('limit').optional().isFloat({ min: 0 }),
    body('xp').optional().isFloat({ min: 0 }),
    body('coins').optional().isFloat({ min: 0 }),
    validationMiddleware,
    promoCodeController.createPromoCode
);

promoCodeRouter.get(
    '/',
    permissionMiddleware(Permissions.PromoCodes),
    query('active').isBoolean().optional(),
    validationMiddleware,
    paginationMiddleware,
    promoCodeController.getPromocodes
);

promoCodeRouter.get(
    '/:id',
    permissionMiddleware(Permissions.PromoCodes),
    param('id').isNumeric(),
    validationMiddleware,
    promoCodeController.getPromocodeById
);

promoCodeRouter.get(
    '/:id/user',
    permissionMiddleware(Permissions.PromoCodes),
    param('id').isNumeric(),
    paginationMiddleware,
    validationMiddleware,
    promoCodeController.getUsersByPromocodeId
);

promoCodeRouter.delete(
    '/:id/finish',
    permissionMiddleware(Permissions.PromoCodes),
    param('id').isNumeric(),
    validationMiddleware,
    promoCodeController.finishPromocode
);
