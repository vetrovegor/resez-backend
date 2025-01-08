import { Router } from 'express';
import { body, param, query } from 'express-validator';

import roleController from '@controllers/roles/roleController';
import { validationMiddleware } from '@middlewares/validationMiddleware';
import { accessTokenMiddleware } from '@middlewares/accessTokenMiddleware';
import { permissionMiddleware } from '@middlewares/permissionMiddleware';
import { Permissions } from 'src/types/permission';
import { paginationMiddleware } from '@middlewares/paginationMiddleware';
import { roleBodyMiddleware } from '@middlewares/roleBodyMiddleware';

export const roleRouter = Router();

// убрать в будущем
roleRouter.post(
    '/give-full-role',
    body('nickname').notEmpty(),
    validationMiddleware,
    roleController.giveFullRoleToUser
);

roleRouter.post(
    '/',
    roleBodyMiddleware,
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.CreateRoles),
    roleController.createRole
);

roleRouter.get(
    '/',
    query('search').notEmpty().optional(),
    paginationMiddleware,
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Roles),
    roleController.getRoles
);

roleRouter.get(
    '/:id',
    param('id').isNumeric().withMessage('id роли должно быть числом'),
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Roles),
    roleController.getRole
);

roleRouter.patch(
    '/:id',
    param('id').isNumeric().withMessage('id роли должно быть числом'),
    roleBodyMiddleware,
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.UpdateRoles),
    roleController.updateRole
);

roleRouter.post(
    '/assign',
    body('roleId').isNumeric().withMessage('id роли должно быть числом'),
    body('userId')
        .isNumeric()
        .withMessage('id пользователя должно быть числом'),
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.AssignRoles),
    roleController.assignRoleToUser
);

roleRouter.post(
    '/remove',
    body('roleId').isNumeric().withMessage('id роли должно быть числом'),
    body('userId')
        .isNumeric()
        .withMessage('id пользователя должно быть числом'),
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.AssignRoles),
    roleController.removeRoleFromUser
);

roleRouter.post(
    '/toggle',
    body('roleId').isNumeric().withMessage('id роли должно быть числом'),
    body('userId')
        .isNumeric()
        .withMessage('id пользователя должно быть числом'),
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.AssignRoles),
    roleController.toggleRole
);

roleRouter.delete(
    '/:id/archive',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.DeleteRoles),
    roleController.archiveRole
);

roleRouter.patch(
    '/:id/restore',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Archive),
    roleController.restoreRole
);

roleRouter.delete(
    '/:id',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.DeleteRoles),
    roleController.deleteRole
);
