import { Request, Response, NextFunction } from 'express';

import permissionService from '@services/roles/permissionService';

class PermissionController {
    async getPermissionsHierarchy(req: Request, res: Response, next: NextFunction) {
        try {
            const permissions = await permissionService.getPermissionsHierarchy();

            res.json({ permissions });
        } catch (error) {
            next(error);
        }
    }
}

export default new PermissionController();