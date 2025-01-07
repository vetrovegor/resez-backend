import { Router } from 'express';

import { healthRouter } from './healthRouter';
import { authRouter } from './authRouter';
import { userRouter } from './userRouter';
import { sessionRouter } from './sessionRouter';
import { adminRouter } from './admin/adminRouter';
import { messengerRouter } from './messenger/mesengerRouter';
import { achievementRouter } from './achievementRouter';
import { storeRouter } from './store/storeRouter';
import { subscriptionRouter } from './subscriptionRouter';
import { feedbackRouter } from './feedbackRouter';
import { promoCodeRouter } from './promoCodeRouter';
import { liveKitRouter } from './liveKitRouter';

export const router = Router();

router.use('/health', healthRouter);

router.use('/auth', authRouter);

router.use('/user', userRouter);

router.use('/session', sessionRouter);

router.use('/admin', adminRouter);

router.use('/messenger', messengerRouter);

router.use('/achievement', achievementRouter);

router.use('/store', storeRouter);

router.use('/subscription', subscriptionRouter);

router.use('/feedback', feedbackRouter);

router.use('/promo-code', promoCodeRouter);

router.use('/live-kit', liveKitRouter);
