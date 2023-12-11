import { Router } from "express";

import subjectController from "../../controllers/education/subjectController";
import { paginationMiddleware } from "../../middlewares/paginationMiddleware";
import { accessTokenMiddleware } from "../../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../../middlewares/blockedMiddleware";

export const archiveRouter = Router();

archiveRouter.get(
    '/subject',
    paginationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    subjectController.getArchivedSubjects   
);