import { Router } from "express";
import { body } from 'express-validator';

import authController from "../controllers/authController";
import { refreshTokenMiddleware } from "../middlewares/refreshTokenMiddleware";
import { accessTokenMiddleware } from "../middlewares/accessTokenMiddleware";

export const authRouter = Router();

authRouter.post(
    '/register',
    body('nickname').matches(/^[a-zA-Z0-9_]{3,20}$/),
    body('password').isLength({ min: 8, max: 32 }),
    authController.register
);

authRouter.post(
    '/login',
    body('nickname').matches(/^[a-zA-Z0-9_]{3,20}$/),
    body('password').isLength({ min: 8, max: 32 }),
    authController.login
);

authRouter.get(
    '/logout',
    refreshTokenMiddleware,
    authController.logout
);

authRouter.get(
    '/refresh',
    refreshTokenMiddleware,
    authController.refresh
);

authRouter.get('/send-verification-code',
    accessTokenMiddleware,
    authController.sendVerificationCode
);

authRouter.post(
    '/send-recovery-password-code',
    body('nickname').matches(/^[a-zA-Z0-9_]{3,20}$/),
    authController.sendRecoveryPasswordCode
);

authRouter.post('/verify-recovery-password-code',
    body('nickname').matches(/^[a-zA-Z0-9_]{3,20}$/),
    body('code').matches(/^[0-9]{6}$/),
    authController.verifyRecoveryPasswordCode
);

authRouter.put('/recovery-password',
    body('nickname').matches(/^[a-zA-Z0-9_]{3,20}$/),
    body('code').matches(/^[0-9]{6}$/),
    body('password').isLength({ min: 8, max: 32 }),
    authController.recoveryPassword);