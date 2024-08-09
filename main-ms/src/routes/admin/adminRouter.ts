import { Router } from "express";

import { roleRouter } from "./roles/roleRouter";
import { archiveRouter } from "./archiveRouter";
import { permissionRouter } from "./roles/permissionRouter";
import { notifyRouter } from "./notify/notifyRouter";
import { notifyTypeRouter } from "./notify/notifyTypeRouter";
import { userRouter } from "./userRouter";
import { subscriptionRouter } from "./subscriptionRouter";
import { storeRouter } from "./store/storeRouter";
import { feedbackRouter } from "./feedbackRouter";

export const adminRouter = Router();

adminRouter.use('/user', userRouter);

adminRouter.use('/role', roleRouter);

adminRouter.use('/permission', permissionRouter);

adminRouter.use('/archive', archiveRouter);

adminRouter.use('/notify', notifyRouter);

adminRouter.use('/notify-type', notifyTypeRouter);

adminRouter.use('/subscription', subscriptionRouter);

adminRouter.use('/store', storeRouter);

adminRouter.use('/feedback', feedbackRouter);