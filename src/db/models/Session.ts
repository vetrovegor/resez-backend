import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo } from "sequelize-typescript";

import Token from "./Token";
import User from "./User";
import { SessionDTO } from "types/session";

@Table({
    timestamps: false,
    tableName: "sessions"
})
class Session extends Model {
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true
    })
    isActive: boolean;

    @Column({
        type: DataType.DATE
    })
    date: Date;

    @Column({
        type: DataType.DATE
    })
    expiredDate: Date;

    @Column({
        type: DataType.STRING
    })
    ip: string;

    @Column({
        type: DataType.STRING
    })
    deviceType: string;

    @Column({
        type: DataType.STRING
    })
    country: string;

    @Column({
        type: DataType.STRING
    })
    city: string;

    @Column({
        type: DataType.STRING
    })
    browser: string;

    @Column({
        type: DataType.STRING
    })
    browserVersion: string;

    @Column({
        type: DataType.STRING
    })
    os: string;

    @Column({
        type: DataType.STRING
    })
    platform: string;

    @ForeignKey(() => User)
    @Column
    userId: number;

    @BelongsTo(() => User)
    user: User;

    @HasMany(() => Token)
    tokens: Token[];

    toDTO(): SessionDTO {
        const { id, isActive, date, ip, deviceType, country, city, browser, browserVersion, os, platform } = this.get();

        return {
            id,
            isActive,
            date,
            ip,
            deviceType,
            country,
            city,
            browser,
            browserVersion,
            os,
            platform,
        };
    }
}

export default Session;