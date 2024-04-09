import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";

import Role from "./roles/Role";
import User from "./User";

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

    @BelongsTo(() => Role)
    role: Role;
}

export default UserRole;