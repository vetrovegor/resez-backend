import { Router } from 'express';

import permissionController from '@controllers/roles/permissionController';
import { accessTokenMiddleware } from '@middlewares/accessTokenMiddleware';
import { permissionMiddleware } from '@middlewares/permissionMiddleware';
import { Permissions } from 'src/types/permission';

export const permissionRouter = Router();

permissionRouter.get(
    '/',
    accessTokenMiddleware(true),
    permissionMiddleware(Permissions.Roles),
    permissionController.getPermissionsHierarchy
);
