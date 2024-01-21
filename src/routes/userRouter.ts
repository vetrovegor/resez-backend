import { Router } from "express";
import { body, query } from "express-validator";

import { accessTokenMiddleware } from "../middlewares/accessTokenMiddleware";
import userController from "../controllers/userController";
import { blockedMiddleware } from "../middlewares/blockedMiddleware";
import { userProfileMiddleware } from "../middlewares/userProfileMiddleware";
import { fileMiddleware } from "../middlewares/fileMiddleware";
import { imageMiddleware } from "../middlewares/imageMiddleware";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import { paginationMiddleware } from "../middlewares/paginationMiddleware";

export const userRouter = Router();

userRouter.get(
    '/short-info',
    accessTokenMiddleware,
    userController.getUserShortInfo
);

userRouter.post(
    '/send-change-password-code',
    body('oldPassword').isLength({ min: 8, max: 32 }),
    body('newPassword').isLength({ min: 8, max: 32 }),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    userController.sendChangePasswordCode
);

userRouter.patch(
    '/verify-change-password-code',
    body('oldPassword').isLength({ min: 8, max: 32 }),
    body('newPassword').isLength({ min: 8, max: 32 }),
    body('code').matches(/^[0-9]{6}$/),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    userController.verifyChangePasswordCode
);

userRouter.get(
    '/profile-info',
    accessTokenMiddleware,
    blockedMiddleware,
    userController.getProfileInfo
);

userRouter.patch(
    '/profile-info',
    userProfileMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    userController.updateProfile
);

userRouter.post(
    '/avatar',
    accessTokenMiddleware,
    blockedMiddleware,
    fileMiddleware(2),
    imageMiddleware,
    userController.setAvatar
);

userRouter.delete(
    '/avatar',
    accessTokenMiddleware,
    blockedMiddleware,
    userController.deleteAvatar
);

userRouter.patch(
    '/settings',
    body('isPrivateAccount').isBoolean(),
    body('isHideAvatars').isBoolean(),
    accessTokenMiddleware,
    blockedMiddleware,
    userController.updateSettings
);

userRouter.get(
    '/',
    query('search').isString().withMessage('Параметр search является обязательным.'),
    validationMiddleware,
    paginationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    userController.searchUsers
);