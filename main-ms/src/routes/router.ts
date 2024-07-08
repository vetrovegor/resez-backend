import { Router } from "express";

import { healthRouter } from "./healthRouter";
import { authRouter } from "./authRouter";
import { userRouter } from "./userRouter";
import { sessionRouter } from "./sessionRouter";
import { collectionRouter } from "./collectionRouter";
import { adminRouter } from "./admin/adminRouter";
import { messengerRouter } from "./messenger/mesengerRouter";
import { notifyRouter } from "./notifyRouter";
import { achievementRouter } from "./achievementRouter";
import { storeRouter } from "./store/storeRouter";

export const router = Router();

router.use('/health', healthRouter);

router.use('/auth', authRouter);

router.use('/user', userRouter);

router.use('/session', sessionRouter);

router.use('/notify', notifyRouter);

router.use('/collection', collectionRouter);

router.use('/admin', adminRouter);

router.use('/messenger', messengerRouter);

router.use('/achievement', achievementRouter);

router.use('/store', storeRouter);