import { Router } from "express";
import { body, param } from 'express-validator';

import authController from "../controllers/authController";
import { refreshTokenMiddleware } from "../middlewares/refreshTokenMiddleware";
import { accessTokenMiddleware } from "../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../middlewares/blockedMiddleware";
import { validationMiddleware } from "../middlewares/validationMiddleware";

export const authRouter = Router();

authRouter.post(
    '/register',
    body('nickname').matches(/^[a-zA-Z0-9_]{3,20}$/),
    body('password').isLength({ min: 8, max: 32 }),
    validationMiddleware,
    authController.register
);

authRouter.post(
    '/login',
    body('nickname').matches(/^[a-zA-Z0-9_]{3,20}$/),
    body('password').isLength({ min: 8, max: 32 }),
    validationMiddleware,
    authController.login
);

authRouter.post(
    '/login/:code',
    param('code').isString(),
    validationMiddleware,
    authController.loginByCode
);

authRouter.get(
    '/logout',
    refreshTokenMiddleware,
    authController.logout
);

authRouter.get(
    '/check',
    accessTokenMiddleware,
    refreshTokenMiddleware,
    authController.checkAuth
);

authRouter.get(
    '/refresh',
    refreshTokenMiddleware,
    authController.refresh
);

authRouter.get(
    '/send-verification-code',
    accessTokenMiddleware,
    blockedMiddleware,
    authController.sendVerificationCode
);

authRouter.post(
    '/send-recovery-password-code',
    body('nickname').matches(/^[a-zA-Z0-9_]{3,20}$/),
    validationMiddleware,
    authController.sendRecoveryPasswordCode
);

authRouter.post('/verify-recovery-password-code',
    body('nickname').matches(/^[a-zA-Z0-9_]{3,20}$/),
    body('code').matches(/^[0-9]{6}$/),
    validationMiddleware,
    authController.verifyRecoveryPasswordCode
);

authRouter.patch('/recovery-password',
    body('nickname').matches(/^[a-zA-Z0-9_]{3,20}$/),
    body('code').matches(/^[0-9]{6}$/),
    body('password').isLength({ min: 8, max: 32 }),
    validationMiddleware,
    authController.recoveryPassword);