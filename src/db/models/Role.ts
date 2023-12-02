import { Table, Column, Model, DataType, BelongsToMany } from "sequelize-typescript";

import RolePermission from "./RolePermission";
import Permission from "./Permission";
import User from "./User";
import UserRole from "./UserRole";

@Table({
    timestamps: true,
    tableName: "roles"
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

    @BelongsToMany(() => Permission, () => RolePermission)
    permissions: Permission[];

    @BelongsToMany(() => User, () => UserRole)
    users: User[];
}

export default Role;