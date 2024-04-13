import { Router } from "express";

import { roleRouter } from "./roles/roleRouter";
import { subjectsRouter } from "./education/subjectRouter";
import { archiveRouter } from "./archiveRouter";
import { permissionRouter } from "./roles/permissionRouter";
import { notifyRouter } from "./notify/notifyRouter";
import { notifyTypeRouter } from "./notify/notifyTypeRouter";
import { userRouter } from "./userRouter";

export const adminRouter = Router();

adminRouter.use('/user', userRouter)

adminRouter.use('/role', roleRouter);

adminRouter.use('/permission', permissionRouter);

adminRouter.use('/subject', subjectsRouter);

adminRouter.use('/archive', archiveRouter);

adminRouter.use('/notify', notifyRouter);

adminRouter.use('/notify-type', notifyTypeRouter);