import { Router } from "express";

import subjectController from "../../controllers/education/subjectController";
import { paginationMiddleware } from "../../middlewares/paginationMiddleware";
import { accessTokenMiddleware } from "../../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../../middlewares/blockedMiddleware";
import { permissionMiddleware } from "../../middlewares/permissionMiddleware";
import roleController from "../../controllers/roles/roleController";
import { Permissions } from "types/permission";

export const archiveRouter = Router();

archiveRouter.get(
    '/subject',
    paginationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.Archive),
    subjectController.getArchivedSubjects   
);

archiveRouter.get(
    '/role',
    paginationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.Archive),
    roleController.getArchivedRoles   
);