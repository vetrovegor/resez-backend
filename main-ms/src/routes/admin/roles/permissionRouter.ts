import { Router } from "express";

import permissionController from "../../../controllers/roles/permissionController";
import { accessTokenMiddleware } from "../../../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../../../middlewares/blockedMiddleware";
import { permissionMiddleware } from "../../../middlewares/permissionMiddleware";
import { Permissions } from "types/permission";

export const permissionRouter = Router();

permissionRouter.get(
    '/',
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Roles),
    permissionController.getPermissionsHierarchy
);