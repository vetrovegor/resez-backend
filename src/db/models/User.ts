import { Table, Column, Model, DataType, HasMany, BelongsToMany } from "sequelize-typescript";

import { UserPreview, UserProfileInfo, UserShortInfo, UserTokenInfo } from "types/user";
import Session from "./Session";
import Code from "./Code";
import Collection from "./Collection";
import UserRole from "./UserRole";
import Role from "./Role";
import Message from "./messenger/Message";
import Chat from "./messenger/Chat";
import UserChat from "./messenger/UserChat";
import { PermissionDTO } from "types/permission";

@Table({
    timestamps: false,
    tableName: "users"
})
class User extends Model {
    @Column({
        type: DataType.STRING,
    })
    nickname: string;

    @Column({
        type: DataType.STRING,
    })
    password: string;

    @Column({
        type: DataType.STRING,
    })
    telegramChatId: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    isVerified: boolean;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    isBlocked: boolean;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 1,
    })
    level: number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0,
    })
    xp: number;

    @Column({
        type: DataType.INTEGER,
    })
    activeStatusId: number;

    @Column({
        type: DataType.STRING,
    })
    avatar: string;

    @Column({
        type: DataType.STRING,
    })
    firstName: string;

    @Column({
        type: DataType.STRING,
    })
    lastName: string;

    @Column({
        type: DataType.DATE,
    })
    birthDate: Date;

    @Column({
        type: DataType.STRING,
    })
    gender: string;

    @Column({
        type: DataType.DATE,
    })
    registrationDate: Date;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    isPrivateAccount: boolean;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    isHideAvatars: boolean;

    @HasMany(() => Session)
    sessions: Session[];

    @HasMany(() => Code)
    codes: Code[];

    @HasMany(() => Collection)
    collections: Collection[];

    @BelongsToMany(() => Role, () => UserRole)
    roles: Role[];

    @BelongsToMany(() => Chat, () => UserChat)
    chats: Chat[];

    @HasMany(() => Message, {
        onDelete: 'CASCADE'
    })
    messages: Message[];

    async getRoles(): Promise<Role[]> {
        const userRoles = await UserRole.findAll({
            where: { userId: this.get('id') },
            attributes: [],
            include: [{ model: Role }]
        });

        return userRoles.map(userRole => userRole.get('role'));
    }

    async getPermissions(): Promise<PermissionDTO[]> {
        const roles = await this.getRoles();
        const permissions: PermissionDTO[] = [];

        for (const role of roles) {
            const rolePermissions = await role.getPermissions();

            const rolePermissionDTOs = rolePermissions.map(
                permission => permission.toDTO()
            );

            for (const permission of rolePermissionDTOs) {
                if (!permissions.some((p) => p.id === permission.id)) {
                    permissions.push(permission);
                }
            }
        }

        return permissions;
    }

    toTokenInfo(): UserTokenInfo {
        const { id, nickname } = this.get();

        return {
            id,
            nickname
        };
    }

    async toShortInfo(): Promise<UserShortInfo> {
        const { id, nickname, isVerified, isBlocked, avatar, level } = this.get();

        const permissions = await this.getPermissions();

        return {
            id,
            nickname,
            isVerified,
            isBlocked,
            avatar: avatar ? process.env.STATIC_URL + avatar : null,
            level,
            permissions
        };
    }

    toPreview(): UserPreview {
        const { id, nickname, avatar } = this.get();

        return {
            id,
            nickname,
            avatar: avatar ? process.env.STATIC_URL + avatar : null,
        };
    }

    toProfileInfo(): UserProfileInfo {
        const { id, firstName, lastName, birthDate, gender } = this.get();

        return {
            id,
            firstName,
            lastName,
            birthDate,
            gender
        };
    }
}

export default User;