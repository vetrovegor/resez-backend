import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";

import Role from "./Role";
import User from "./User";
import { PermissionDto } from "types/permission";

@Table({
    timestamps: false,
    tableName: 'users_roles'
})
class UserRole extends Model {
    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER
    })
    userId: number;

    @ForeignKey(() => Role)
    @Column({
        type: DataType.INTEGER
    })
    roleId: number;
}

export default UserRole;