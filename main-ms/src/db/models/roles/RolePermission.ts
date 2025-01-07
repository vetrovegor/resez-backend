import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo
} from 'sequelize-typescript';

import Permission from './Permission';
import Role from './Role';

@Table({
    timestamps: false,
    tableName: 'roles_permissions'
})
class RolePermission extends Model {
    @ForeignKey(() => Role)
    @Column({
        type: DataType.INTEGER
    })
    roleId: number;

    @BelongsTo(() => Role)
    role: Role;

    @ForeignKey(() => Permission)
    @Column({
        type: DataType.INTEGER
    })
    permissionId: number;

    @BelongsTo(() => Permission)
    permission: Permission;
}

export default RolePermission;
