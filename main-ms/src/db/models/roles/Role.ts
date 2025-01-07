import {
    Table,
    Column,
    Model,
    DataType,
    BelongsToMany,
    HasMany
} from 'sequelize-typescript';

import RolePermission from './RolePermission';
import Permission from './Permission';
import User from '../User';
import UserRole from '../UserRole';
import { RoleFullInfo, RolePreview, RoleShortInfo } from 'src/typesrole';

@Table({
    timestamps: true,
    tableName: 'roles'
})
class Role extends Model {
    @Column({
        type: DataType.STRING
    })
    role: string;

    @Column({
        type: DataType.STRING
    })
    textColor: string;

    @Column({
        type: DataType.STRING
    })
    backgroundColor: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isArchived: boolean;

    @BelongsToMany(() => Permission, () => RolePermission)
    permissions: Permission[];

    @BelongsToMany(() => User, () => UserRole)
    users: User[];

    @HasMany(() => UserRole, {
        onDelete: 'CASCADE'
    })
    userRoles: UserRole[];

    async getPermissions(): Promise<Permission[]> {
        const rolePermissions = await RolePermission.findAll({
            where: {
                roleId: this.get('id')
            },
            attributes: [],
            include: [{ model: Permission }]
        });

        return rolePermissions.map(permission => permission.get('permission'));
    }

    toPreview(): RolePreview {
        const { id, role, textColor, backgroundColor } = this.get();

        return {
            id,
            role,
            textColor,
            backgroundColor
        };
    }

    async toShortInfo(): Promise<RoleShortInfo> {
        const { id, role, textColor, backgroundColor } = this.get();

        const permissionsCount = await RolePermission.count({
            where: {
                roleId: id
            }
        });

        const usersCount = await UserRole.count({
            where: {
                roleId: id
            }
        });

        return {
            id,
            role,
            textColor,
            backgroundColor,
            permissionsCount,
            usersCount
        };
    }

    async toFullInfo(): Promise<RoleFullInfo> {
        const permissions = await this.getPermissions();
        const permissionIDs = permissions.map(permission => permission.id);

        const extendedPermissions = await Promise.all(
            permissions.map(async permissionItem => {
                const childPermissionIDs =
                    await permissionItem.getChildPermissionIDs();

                const notFoundChildIDs = childPermissionIDs.filter(
                    permissionId => !permissionIDs.includes(permissionId)
                );

                const { id, permission } = permissionItem.toJSON();

                return {
                    id,
                    permission,
                    isActive:
                        !childPermissionIDs.length || !notFoundChildIDs.length
                };
            })
        );

        const { id, role, textColor, backgroundColor } = this.get();

        return {
            id,
            role,
            textColor,
            backgroundColor,
            permissions: extendedPermissions
        };
    }
}

export default Role;
