import { Table, Column, Model, DataType, ForeignKey, BelongsToMany } from "sequelize-typescript";

import Role from "./Role";
import RolePermission from "./RolePermission";
import { PermissionDto } from "types/permission";

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

    toDto(): PermissionDto {
        const { id, permission } = this.get();

        return {
            id,
            permission
        };
    }
}

export default Permission;