import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";

import { UserPreview, UserShortInfo, UserTokenInfo } from "types/user";
import Session from "./Session";
import Code from "./Code";
import Collection from "./Collection";

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

    toTokenInfo(): UserTokenInfo {
        const { id, nickname } = this.get();

        return {
            id,
            nickname
        };
    }

    toShortInfo(): UserShortInfo {
        const { id, nickname, isVerified, isBlocked, avatar, level } = this.get();

        return {
            id,
            nickname,
            isVerified,
            isBlocked,
            avatar,
            level
        };
    }

    toPreview(): UserPreview {
        const { id, nickname, avatar } = this.get();

        return {
            id,
            nickname,
            avatar
        };
    }
}

export default User;