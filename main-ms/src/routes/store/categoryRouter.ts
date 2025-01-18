import { Router } from 'express';
import { param } from 'express-validator';

import { paginationMiddleware } from '@middlewares/paginationMiddleware';
import { validationMiddleware } from '@middlewares/validationMiddleware';
import categoryController from '@controllers/store/categoryController';

export const categoryRouter = Router();

categoryRouter.get(
    '/',
    paginationMiddleware,
    categoryController.getCategoriesForUser
);

categoryRouter.get(
    '/:slug',
    param('slug')
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .notEmpty(),
    validationMiddleware,
    validationMiddleware,
    categoryController.getCategoriesProductsBySlug
);
