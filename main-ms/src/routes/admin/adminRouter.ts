import { Router } from 'express';

import { roleRouter } from './roles/roleRouter';
import { archiveRouter } from './archiveRouter';
import { permissionRouter } from './roles/permissionRouter';
import { userRouter } from './userRouter';
import { subscriptionRouter } from './subscriptionRouter';
import { storeRouter } from './store/storeRouter';
import { feedbackRouter } from './feedbackRouter';
import { promoCodeRouter } from './promoCodeRouter';
import { achievementRouter } from './achievementRouter';
import { accessTokenMiddleware } from '@middlewares/accessTokenMiddleware';

export const adminRouter = Router();

adminRouter.use(accessTokenMiddleware(true));

adminRouter.use('/user', userRouter);

adminRouter.use('/role', roleRouter);

adminRouter.use('/permission', permissionRouter);

adminRouter.use('/archive', archiveRouter);

adminRouter.use('/subscription', subscriptionRouter);

adminRouter.use('/store', storeRouter);

adminRouter.use('/feedback', feedbackRouter);

adminRouter.use('/promo-code', promoCodeRouter);

adminRouter.use('/achievement', achievementRouter);
