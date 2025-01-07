import { Router } from 'express';
import { body, param, query } from 'express-validator';

import { accessTokenMiddleware } from '@middlewares/accessTokenMiddleware';
import userController from '@controllers/userController';
import { userProfileMiddleware } from '@middlewares/userProfileMiddleware';
import { fileMiddleware } from '@middlewares/fileMiddleware';
import { imageMiddleware } from '@middlewares/imageMiddleware';
import { validationMiddleware } from '@middlewares/validationMiddleware';
import { paginationMiddleware } from '@middlewares/paginationMiddleware';
import avatarDecorationController from '@controllers/store/avatarDecorationController';
import themeController from '@controllers/store/themeController';

export const userRouter = Router();

userRouter.get(
    '/short-info',
    accessTokenMiddleware(false),
    userController.getUserShortInfo
);

userRouter.get(
    '/permission',
    accessTokenMiddleware(true),
    userController.getUserPermissions
);

userRouter.post(
    '/send-change-password-code',
    body('oldPassword').isLength({ min: 8, max: 32 }),
    body('newPassword').isLength({ min: 8, max: 32 }),
    validationMiddleware,
    accessTokenMiddleware(true),
    userController.sendChangePasswordCode
);

userRouter.patch(
    '/verify-change-password-code',
    body('oldPassword').isLength({ min: 8, max: 32 }),
    body('newPassword').isLength({ min: 8, max: 32 }),
    body('code').matches(/^[0-9]{6}$/),
    validationMiddleware,
    accessTokenMiddleware(true),
    userController.verifyChangePasswordCode
);

userRouter.get(
    '/profile-info',
    accessTokenMiddleware(true),
    userController.getProfileInfo
);

userRouter.patch(
    '/profile-info',
    userProfileMiddleware,
    accessTokenMiddleware(true),
    userController.updateProfile
);

userRouter.post(
    '/avatar',
    accessTokenMiddleware(true),
    fileMiddleware(2),
    imageMiddleware,
    userController.setAvatar
);

userRouter.delete(
    '/avatar',
    accessTokenMiddleware(true),
    userController.deleteAvatar
);

// магазин
userRouter.get(
    '/avatar-decoration',
    accessTokenMiddleware(true),
    paginationMiddleware,
    avatarDecorationController.getUserAvatarDecorations
);

userRouter.patch(
    '/avatar-decoration/:id',
    accessTokenMiddleware(true),
    param('id').isNumeric(),
    validationMiddleware,
    userController.setAvatarDecoration
);

userRouter.delete(
    '/avatar-decoration',
    accessTokenMiddleware(true),
    userController.deleteAvatarDecoration
);

userRouter.get(
    '/theme',
    accessTokenMiddleware(true),
    paginationMiddleware,
    themeController.getUserThemes
);

userRouter.patch(
    '/theme/:id',
    accessTokenMiddleware(true),
    param('id').isNumeric(),
    validationMiddleware,
    userController.setTheme
);

userRouter.delete(
    '/theme',
    accessTokenMiddleware(true),
    userController.deleteTheme
);

userRouter.get(
    '/settings',
    accessTokenMiddleware(true),
    userController.getUserSettings
);

userRouter.patch(
    '/settings',
    body('isPrivateAccount').isBoolean().optional(),
    body('isHideAvatars').isBoolean().optional(),
    validationMiddleware,
    accessTokenMiddleware(true),
    userController.updateSettings
);

userRouter.get(
    '/achievement',
    accessTokenMiddleware(true),
    userController.getUserAchievements
);

userRouter.get(
    '/:nickname',
    param('nickname').isString(),
    validationMiddleware,
    userController.getUser
);

userRouter.get(
    '/',
    query('search')
        .isString()
        .withMessage('Параметр search является обязательным.'),
    validationMiddleware,
    paginationMiddleware,
    accessTokenMiddleware(true),
    userController.searchUsers
);
