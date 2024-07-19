import { Router } from "express";

import { paginationMiddleware } from "../../middlewares/paginationMiddleware";
import { accessTokenMiddleware } from "../../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../../middlewares/blockedMiddleware";
import { permissionMiddleware } from "../../middlewares/permissionMiddleware";
import roleController from "../../controllers/roles/roleController";
import { Permissions } from "types/permission";

export const archiveRouter = Router();

archiveRouter.get(
    '/role',
    paginationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.Archive),
    roleController.getArchivedRoles   
);