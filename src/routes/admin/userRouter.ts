import { Router } from "express";

import { paginationMiddleware } from "../../middlewares/paginationMiddleware";
import { accessTokenMiddleware } from "../../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../../middlewares/blockedMiddleware";
import { permissionMiddleware } from "../../middlewares/permissionMiddleware";
import { Permissions } from "types/permission";
import userController from "../../controllers/userController";
import { body } from "express-validator";

export const userRouter = Router();

userRouter.get(
    '/',
    paginationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.Users),
    userController.getUsers   
);

userRouter.patch(
    '/:id/block',
    body('reason').isString().optional(),
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.BlockUsers),
    userController.blockUser   
);

userRouter.patch(
    '/:id/unblock',
    accessTokenMiddleware,
    blockedMiddleware,
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