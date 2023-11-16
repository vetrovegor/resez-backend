import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

import User from './User';

@Table
@Table({
    timestamps: false,
    tableName: "codes"
})
class Code extends Model {
    @Column({
        type: DataType.STRING,
    })
    code: string;

    @Column({
        type: DataType.DATE,
    })
    retryDate: Date;

    @Column({
        type: DataType.DATE,
    })
    expiredDate: Date;

    @Column({
        type: DataType.STRING,
    })
    type: string;

    @ForeignKey(() => User)
    @Column
    userId: number;

    @BelongsTo(() => User)
    user: User;
}

export default Code;