import { Router } from 'express';

import { paginationMiddleware } from '@middlewares/paginationMiddleware';
import { accessTokenMiddleware } from '@middlewares/accessTokenMiddleware';
import { permissionMiddleware } from '@middlewares/permissionMiddleware';
import { Permissions } from 'src/types/permission';
import userController from '@controllers/userController';
import { body, param, query } from 'express-validator';
import { validationMiddleware } from '@middlewares/validationMiddleware';

export const userRouter = Router();

userRouter.get(
    '/stats',
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Admin),
    userController.getStats
);

userRouter.get(
    '/',
    query('search').notEmpty().optional(),
    query('blocked').isBoolean().optional(),
    query('verified').isBoolean().optional(),
    query('online').isBoolean().optional(),
    query('has_role').isBoolean().optional(),
    query('role').isNumeric().optional(),
    query('ids').isNumeric().optional(),
    query('short').isBoolean().optional(),
    validationMiddleware,
    paginationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Users),
    userController.getUsers
);

userRouter.get(
    '/:id',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Users),
    userController.getAdminUserProfileInfo
);

userRouter.get(
    '/:id/info',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Users),
    userController.getAdminUserBasicInfo
);

userRouter.get(
    '/:id/session',
    param('id').isNumeric(),
    paginationMiddleware,
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Users),
    userController.getUserSessions
);

userRouter.patch(
    '/:id/block',
    param('id').isNumeric(),
    validationMiddleware,
    body('reason').isString().optional(),
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.BlockUsers),
    userController.blockUser
);

userRouter.patch(
    '/:id/unblock',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.BlockUsers),
    userController.unblockUser
);

// убрать
userRouter.patch(
    '/increase-xp',
    body('nickname').isString(),
    body('xp').isNumeric(),
    userController.increaseXP
);

userRouter.patch(
    '/:id/add-coins',
    param('id').isNumeric(),
    validationMiddleware,
    body('amount').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Users),
    userController.addCoins
);

userRouter.get(
    '/:id/role',
    param('id').isNumeric(),
    validationMiddleware,
    paginationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.AssignRoles),
    userController.getUserRoles
);

userRouter.delete(
    '/:id/subscription',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Users),
    userController.removeSubscriptionFromUser
);
