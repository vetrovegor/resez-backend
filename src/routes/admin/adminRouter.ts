import { Router } from "express";
import { roleRouter } from "./roleRouter";
import { subjectsRouter } from "./education/subjectRouter";
import { archiveRouter } from "./archiveRouter";

export const adminRouter = Router();

adminRouter.use('/role', roleRouter);

adminRouter.use('/subject', subjectsRouter);

adminRouter.use('/archive', archiveRouter);