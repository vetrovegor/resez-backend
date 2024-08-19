import { Request, Response, NextFunction } from 'express';

import {
    PaginationQuery,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery,
    IdParam,
    RequestWithParamsAndUser,
    RequestWithQueryAndUser
} from 'types/request';
import roleService from '../../services/roles/roleService';
import { ToggleRoleBodyDTO, RoleBodyDTO } from 'types/role';
import permissionService from '../../services/roles/permissionService';

class RoleController {
    // убрать в будущем
    async giveFullRoleToUser(
        req: RequestWithBody<{ nickname: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            await roleService.giveFullRoleToUser(req.body.nickname);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async createRole(
        req: RequestWithBody<RoleBodyDTO>,
        res: Response,
        next: NextFunction
    ) {
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

    async getRoles(
        req: RequestWithQuery<PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { limit, offset } = req.query;

            const data = await roleService.getRoles(limit, offset);

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async getRole(
        req: RequestWithParams<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const role = await roleService.getRole(req.params.id);

            res.json(role);
        } catch (error) {
            next(error);
        }
    }

    async updateRole(
        req: RequestWithParamsAndBody<IdParam, RoleBodyDTO>,
        res: Response,
        next: NextFunction
    ) {
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

    async assignRoleToUser(
        req: RequestWithBody<ToggleRoleBodyDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { roleId, userId } = req.body;

            await roleService.assignRoleToUser(roleId, userId);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async removeRoleFromUser(
        req: RequestWithBody<ToggleRoleBodyDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { roleId, userId } = req.body;

            await roleService.removeRoleFromUser(roleId, userId);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async toggleRole(
        req: RequestWithBody<ToggleRoleBodyDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { roleId, userId } = req.body;

            await roleService.toggleRole(roleId, userId);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async archiveRole(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const role = await roleService.setRoleArchiveStatus(
                req.params.id,
                true,
                req.user.id
            );

            res.json({ role });
        } catch (error) {
            next(error);
        }
    }

    async restoreRole(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const role = await roleService.setRoleArchiveStatus(
                req.params.id,
                false,
                req.user.id
            );

            res.json({ role });
        } catch (error) {
            next(error);
        }
    }

    async deleteRole(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const role = await roleService.deleteRole(
                req.params.id,
                req.user.id
            );

            res.json({ role });
        } catch (error) {
            next(error);
        }
    }

    async getArchivedRoles(
        req: RequestWithQueryAndUser<PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { limit, offset } = req.query;

            const data = await roleService.getRoles(limit, offset, true);

            res.json(data);
        } catch (error) {
            next(error);
        }
    }
}

export default new RoleController();
