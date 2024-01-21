import { Router } from "express";
import { body, param } from "express-validator";

import roleController from "../../../controllers/roles/roleController";
import { validationMiddleware } from "../../../middlewares/validationMiddleware";
import { accessTokenMiddleware } from "../../../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../../../middlewares/blockedMiddleware";
import { permissionMiddleware } from "../../../middlewares/permissionMiddleware";
import { Permissions } from "types/permission";
import { paginationMiddleware } from "../../../middlewares/paginationMiddleware";
import { roleBodyMiddleware } from "../../../middlewares/roleBodyMiddleware";

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
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.CreateRoles),
    roleController.createRole
);

roleRouter.get(
    '/',
    paginationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.Roles),
    roleController.getRoles
);

roleRouter.get(
    '/:id',
    param('id').isNumeric()
        .withMessage('id роли должно быть числом'),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.Roles),
    roleController.getRole
);

roleRouter.patch(
    '/:id',
    param('id').isNumeric()
        .withMessage('id роли должно быть числом'),
    roleBodyMiddleware,
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.UpdateRoles),
    roleController.updateRole
);

roleRouter.post(
    '/assign',
    body('roleId').isNumeric()
        .withMessage('id роли должно быть числом'),
    body('userId').isNumeric()
        .withMessage('id пользователя должно быть числом'),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    roleController.assignRoleToUser
);