import { Router } from 'express';

import { paginationMiddleware } from '@middlewares/paginationMiddleware';
import { permissionMiddleware } from '@middlewares/permissionMiddleware';
import roleController from '@controllers/roles/roleController';
import { Permissions } from 'src/types/permission';

export const archiveRouter = Router();

archiveRouter.get(
    '/role',
    paginationMiddleware,
    permissionMiddleware(Permissions.Archive),
    roleController.getArchivedRoles
);
