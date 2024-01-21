import { Request, Response, NextFunction } from 'express';

import { PaginationQuery, RequestWithBody, RequestWithParams, RequestWithParamsAndBody, RequestWithQuery, IdParam } from 'types/request';
import roleService from '../../services/roles/roleService';
import { AssignRoleBodyDTO, RoleBodyDTO } from 'types/role';
import permissionService from '../../services/roles/permissionService';

class RoleController {
    // убрать в будущем
    async giveFullRoleToUser(req: RequestWithBody<{ nickname: string }>, res: Response, next: NextFunction) {
        try {
            await roleService.giveFullRoleToUser(req.body.nickname);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async createRole(req: RequestWithBody<RoleBodyDTO>, res: Response, next: NextFunction) {
        try {
            const { role, permissions, textColor, backgroundColor } = req.body;

            const createdRole = await roleService.createRole(
                role,
                permissions,
                textColor,
                backgroundColor
            );

            res.json({ role: createdRole });
        } catch (error) {
            next(error);
        }
    }

    async getRoles(req: RequestWithQuery<PaginationQuery>, res: Response, next: NextFunction) {
        try {
            const { limit, offset } = req.query;

            const data = await roleService.getRoles(limit, offset);

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async getRole(req: RequestWithParams<IdParam>, res: Response, next: NextFunction) {
        try {
            const role = await roleService.getRole(req.params.id);

            res.json(role);
        } catch (error) {
            next(error);
        }
    }

    async updateRole(req: RequestWithParamsAndBody<IdParam, RoleBodyDTO>, res: Response, next: NextFunction) {
        try {
            const { role, permissions, textColor, backgroundColor } = req.body;

            const updateddRole = await roleService.updateRole(
                req.params.id,
                role,
                permissions,
                textColor,
                backgroundColor
            );

            res.json({ role: updateddRole });
        } catch (error) {
            next(error);
        }
    }

    async assignRoleToUser(req: RequestWithBody<AssignRoleBodyDTO>, res: Response, next: NextFunction) {
        try {
            const { roleId, userId } = req.body;

            await roleService.assignRoleToUser(roleId, userId);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }
}

export default new RoleController();