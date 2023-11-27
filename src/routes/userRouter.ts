import { Router } from "express";
import { body } from "express-validator";

import { accessTokenMiddleware } from "../middlewares/accessTokenMiddleware";
import userController from "../controllers/userController";
import { blockedMiddleware } from "../middlewares/blockedMiddleware";
import { userProfileMiddleware } from "../middlewares/userProfileMiddleware";
import { fileMiddleware } from "../middlewares/fileMiddleware";
import { imageMiddleware } from "../middlewares/imageMiddleware";

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
    accessTokenMiddleware,
    blockedMiddleware,
    userController.sendChangePasswordCode
);

userRouter.patch(
    '/verify-change-password-code',
    body('oldPassword').isLength({ min: 8, max: 32 }),
    body('newPassword').isLength({ min: 8, max: 32 }),
    body('code').matches(/^[0-9]{6}$/),
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
    '/update-profile',
    userProfileMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    userController.updateProfile
);

userRouter.patch(
    '/set-avatar',
    accessTokenMiddleware,
    blockedMiddleware,
    fileMiddleware(2),
    imageMiddleware,
    userController.setAvatar
);

userRouter.patch(
    '/delete-avatar',
    accessTokenMiddleware,
    blockedMiddleware,
    userController.deleteAvatar
);