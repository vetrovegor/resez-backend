import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";

import { UserShortInfo, UserTokenInfo } from "types/user.js";
import Session from "./Session.js";
import Code from "./Code.js";

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

    toTokenInfo(): UserTokenInfo {
        return {
            id: this.get('id'),
            nickname: this.get('nickname')
        };
    }
    
    toShortInfo(): UserShortInfo {
        return {
            id: this.get('id'),
            nickname: this.get('nickname'),
            isVerified: this.get('isVerified'),
            isBlocked: this.get('isBlocked'),
            avatar: this.get('avatar'),
            level: this.get('level')
        };
    }
}

export default User;