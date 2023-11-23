import { Router } from "express";

import { healthRouter } from "./healthRouter";
import { authRouter } from "./authRouter";
import { userRouter } from "./userRouter";
import { sessionRouter } from "./sessionRouter";
import { collectionRouter } from "./collectionRouter";

export const router = Router();

router.use('/health', healthRouter);

router.use('/auth', authRouter);

router.use('/user', userRouter);

router.use('/session', sessionRouter);

router.use('/collection', collectionRouter);