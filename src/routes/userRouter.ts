import { Router } from "express";
import { body } from "express-validator";

import { accessTokenMiddleware } from "../middlewares/accessTokenMiddleware";
import userController from "../controllers/userController";

export const userRouter = Router();

userRouter.post(
    '/send-change-password-code',
    body('oldPassword').isLength({ min: 8, max: 32 }),
    body('newPassword').isLength({ min: 8, max: 32 }),
    accessTokenMiddleware,
    userController.sendChangePasswordCode
);

userRouter.patch('/verify-change-password-code',
    body('oldPassword').isLength({ min: 8, max: 32 }),
    body('newPassword').isLength({ min: 8, max: 32 }),
    body('code').matches(/^[0-9]{6}$/),
    accessTokenMiddleware,
    userController.verifyChangePasswordCode
);