import { Op } from "sequelize";

import Role from "../db/models/Role";
import { ApiError } from "../apiError";
import userService from "./userService";
import permissionService from "./permissionService";
import RolePermission from "../db/models/RolePermission";
import UserRole from "../db/models/UserRole";
import { RoleFullInfo, RoleShortInfo } from "types/role";
import { PaginationDTO } from "../dto/PaginationDTO";

class RoleService {
    async getRoleById(roleId: number): Promise<Role> {
        const role = await Role.findByPk(roleId);

        if (!role) {
            this.throwRoleNotFoundError();
        }

        return role;
    }

    // убрать в будущем
    async giveFullRoleToUser(nickname: string): Promise<void> {
        const existedUser = await userService.getUserByNickname(nickname);

        if (!existedUser) {
            throw ApiError.notFound('Пользователь не найден');
        }

        const createdRole = await Role.create({
            role: Date.now(),
            textColor: '#007CEE',
            backgroundColor: '#007CEE1A'
        });

        const permissions = await permissionService.getPermissons();

        for (const permission of permissions) {
            await RolePermission.create({
                roleId: createdRole.id,
                permissionId: permission.id
            });
        }

        await UserRole.create({
            userId: existedUser.id,
            roleId: createdRole.id
        });
    }

    async createRole(role: string, permissions: number[], textColor: string, backgroundColor: string): Promise<RoleShortInfo> {
        const existedRole = await Role.findOne({
            where: {
                role
            }
        });

        if (existedRole) {
            this.throwRoleAlreadyExistsError();
        }

        const validatedPermissions = await permissionService.validatePermissionIDs(permissions);

        const createdRole = await Role.create({
            role,
            textColor,
            backgroundColor
        });

        for (const permissionId of validatedPermissions) {
            await RolePermission.create({
                roleId: createdRole.id,
                permissionId
            });
        }

        return await createdRole.toShortInfo();
    }

    async getRoles(limit: number, offset: number): Promise<PaginationDTO<RoleShortInfo>> {
        const roles = await Role.findAll({
            order: [['id', 'DESC']],
            limit,
            offset
        });

        const roleDTOs = await Promise.all(
            roles.map(
                async role => await role.toShortInfo()
            )
        );

        const totalCount = await Role.count();

        return new PaginationDTO("roles", roleDTOs, totalCount, limit, offset);
    }

    async getRole(roleId: number): Promise<RoleFullInfo> {
        const role = await this.getRoleById(roleId);

        return role.toFullInfo();
    }

    async updateRole(roleId: number, role: string, permissions: number[], textColor: string, backgroundColor: string): Promise<RoleShortInfo> {
        const roleData = await Role.findByPk(roleId);

        if (!roleData) {
            this.throwRoleNotFoundError();
        }

        const existedRole = await Role.findOne({
            where: {
                id: { [Op.ne]: roleId },
                role
            }
        });

        if (existedRole) {
            this.throwRoleAlreadyExistsError();
        }

        const validatedPermissions = await permissionService.validatePermissionIDs(permissions);

        roleData.set('role', role);
        roleData.set('textColor', textColor);
        roleData.set('backgroundColor', backgroundColor);
        await roleData.save();

        await RolePermission.destroy({
            where: { roleId }
        });

        for (const permissionId of validatedPermissions) {
            await RolePermission.create({ roleId, permissionId });
        }

        // уведомить пользователей с этой ролью, что их роль обновилась

        return await roleData.toShortInfo();
    }

    async assignRoleToUser(roleId: number, userId: number): Promise<UserRole> {
        await this.getRoleById(roleId);
        await userService.getUserById(userId);

        const existedUserRole = await UserRole.findOne({
            where: {
                userId,
                roleId
            }
        });

        if (existedUserRole) {
            throw ApiError.badRequest('Роль уже добавлена');
        }

        return await UserRole.create({
            userId,
            roleId
        });
    }

    throwRoleAlreadyExistsError() {
        throw ApiError.badRequest('Роль с таким названием уже существует');
    }

    throwRoleNotFoundError() {
        throw ApiError.notFound('Роль не найдена');
    }
}

export default new RoleService();