import { Router } from 'express';
import { body, param } from 'express-validator';

import { permissionMiddleware } from '@middlewares/permissionMiddleware';
import { validationMiddleware } from '@middlewares/validationMiddleware';
import { paginationMiddleware } from '@middlewares/paginationMiddleware';
import { Permissions } from 'src/types/permission';
import categoryController from '@controllers/store/categoryController';

export const categoryRouter = Router();

categoryRouter.post(
    '/',
    permissionMiddleware(Permissions.CreateProducts),
    body('category').isString().notEmpty(),
    body('slug').matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).notEmpty(),
    validationMiddleware,
    categoryController.createCategory
);

categoryRouter.get(
    '/',
    permissionMiddleware(Permissions.Store),
    paginationMiddleware,
    categoryController.getCategoriesForAdmin
);

categoryRouter.get(
    '/:id',
    permissionMiddleware(Permissions.Store),
    param('id').isNumeric(),
    validationMiddleware,
    categoryController.getCategoryInfo
);

categoryRouter.patch(
    '/:id',
    permissionMiddleware(Permissions.CreateProducts),
    param('id').isNumeric(),
    body('category').isString().notEmpty(),
    body('slug').matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).notEmpty(),
    validationMiddleware,
    categoryController.updateCategory
);

categoryRouter.delete(
    '/:id',
    permissionMiddleware(Permissions.CreateProducts),
    param('id').isNumeric(),
    validationMiddleware,
    categoryController.deleteCategory
);