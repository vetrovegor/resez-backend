import { Router } from "express";

import { roleRouter } from "./roleRouter";
import { subjectsRouter } from "./education/subjectRouter";
import { archiveRouter } from "./archiveRouter";
import { permissionRouter } from "./permissionRouter";

export const adminRouter = Router();

adminRouter.use('/role', roleRouter);

adminRouter.use('/permission', permissionRouter);

adminRouter.use('/subject', subjectsRouter);

adminRouter.use('/archive', archiveRouter);