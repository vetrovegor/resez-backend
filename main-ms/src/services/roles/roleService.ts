import { Op } from 'sequelize';

import Role from '@db/models/roles/Role';
import { ApiError } from '../../ApiError';
import userService from '../userService';
import permissionService from './permissionService';
import RolePermission from '@db/models/roles/RolePermission';
import UserRole from '@db/models/UserRole';
import { RoleFullInfo, RoleShortInfo } from 'src/types/role';
import { PaginationDTO } from '../../dto/PaginationDTO';
import rmqService from '@services/rmqService';
import { EmitTypes } from '@enums/socket';
import { Queues } from '@enums/rmq';

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

    async createRole(
        role: string,
        permissions: number[],
        textColor: string,
        backgroundColor: string
    ): Promise<RoleShortInfo> {
        const existedRole = await Role.findOne({
            where: {
                role
            }
        });

        if (existedRole) {
            this.throwRoleAlreadyExistsError();
        }

        const validatedPermissions =
            await permissionService.validatePermissionIDs(permissions);

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

    async getRoles(
        limit: number,
        offset: number,
        isArchived: boolean = false,
        search?: string
    ): Promise<PaginationDTO<RoleShortInfo>> {
        const where = {
            ...(search != undefined && {
                role: { [Op.iLike]: `%${search}%` }
            }),
            isArchived
        };

        const roles = await Role.findAll({
            where,
            order: [[isArchived ? 'updatedAt' : 'createdAt', 'DESC']],
            limit,
            offset
        });

        const roleDTOs = await Promise.all(
            roles.map(async role => await role.toShortInfo())
        );

        const totalCount = await Role.count({
            where
        });

        return new PaginationDTO('roles', roleDTOs, totalCount, limit, offset);
    }

    async getRole(roleId: number): Promise<RoleFullInfo> {
        const role = await this.getRoleById(roleId);

        return role.toFullInfo();
    }

    async updateRole(
        roleId: number,
        role: string,
        permissions: number[],
        textColor: string,
        backgroundColor: string
    ): Promise<RoleShortInfo> {
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

        const validatedPermissions =
            await permissionService.validatePermissionIDs(permissions);

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

        const userRolesData = await UserRole.findAll({ where: { roleId } });
        const userIds = userRolesData.map(item => item.get('userId'));
        await rmqService.sendToQueue(Queues.Socket, EmitTypes.Refresh, {
            userIds,
            action: 'role'
        });

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

    async removeRoleFromUser(roleId: number, userId: number) {
        const userRole = await UserRole.findOne({ where: { roleId, userId } });

        if (!userRole) {
            throw ApiError.notFound('Роль пользователя не найдена');
        }

        return await userRole.destroy();
    }

    async toggleRole(roleId: number, userId: number) {
        await this.getRoleById(roleId);
        await userService.getUserById(userId);

        const userRole = await UserRole.findOne({
            where: { roleId, userId }
        });

        if (userRole) {
            await userRole.destroy();
        } else {
            await UserRole.create({
                userId,
                roleId
            });
        }

        await rmqService.sendToQueue(Queues.Socket, EmitTypes.Refresh, {
            userIds: [Number(userId)],
            action: 'role'
        });
    }

    async setRoleArchiveStatus(
        roleId: number,
        status: boolean,
        userId: number
    ): Promise<RoleShortInfo> {
        const role = await this.getRoleById(roleId);

        role.set('isArchived', status);
        await role.save();

        // залогировать
        // отправить emit полльзователям с этой ролью что их роль удалена или новый permissions = []

        return await role.toShortInfo();
    }

    async deleteRole(roleId: number, userId: number): Promise<RoleShortInfo> {
        const role = await this.getRoleById(roleId);

        await role.destroy();

        // залогировать
        // отправить emit полльзователям с этой ролью что их роль удалена или новый permissions = []

        return await role.toShortInfo();
    }

    async getUserRoles(userId: number, limit: number, offset: number) {
        await userService.getUserById(userId);

        const userRolesData = await UserRole.findAll({ where: { userId } });
        const userRoleIds = userRolesData.map(item => item.get('roleId'));

        const data = await this.getRoles(limit, offset);

        const roles = data.roles as RoleShortInfo[];

        data.roles = roles.map(role => ({
            ...role,
            isAssigned: userRoleIds.includes(role.id)
        }));

        return data;
    }

    throwRoleAlreadyExistsError() {
        throw ApiError.badRequest('Роль с таким названием уже существует');
    }

    throwRoleNotFoundError() {
        throw ApiError.notFound('Роль не найдена');
    }
}

export default new RoleService();
