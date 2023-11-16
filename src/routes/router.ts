import { Router } from "express";

import { healthRouter } from "./healthRouter";
import { authRouter } from "./authRouter";
import { userRouter } from "./userRouter";

export const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/user', userRouter);