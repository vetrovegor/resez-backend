import { Table, Column, Model, DataType, ForeignKey, BelongsToMany, HasMany } from "sequelize-typescript";

import Role from "./Role";
import RolePermission from "./RolePermission";
import { PermissionDTO } from "types/permission";

@Table({
    timestamps: false,
    tableName: 'permissions'
})
class Permission extends Model {
    @Column({
        type: DataType.STRING
    })
    permission: string;

    @ForeignKey(() => Permission)
    @Column({
        type: DataType.INTEGER
    })
    parentId: number;

    @BelongsToMany(() => Role, () => RolePermission)
    roles: Role[];

    @HasMany(() => RolePermission, {
        onDelete: 'CASCADE'
    })
    rolePermissions: RolePermission[];

    async getChildPermissionIDs(): Promise<number[]> {
        const childPermissions = await Permission.findAll({
            where: {
                parentId: this.get('id')
            }
        });

        let childPermissionIDs = childPermissions.map(permission => permission.id);

        for (const permission of childPermissions) {
            const grandchildrenIDs = await permission.getChildPermissionIDs();
            childPermissionIDs = childPermissionIDs.concat(grandchildrenIDs);
        }

        return childPermissionIDs;
    }

    toDTO(): PermissionDTO {
        const { id, permission } = this.get();

        return {
            id,
            permission
        };
    }
}

export default Permission;