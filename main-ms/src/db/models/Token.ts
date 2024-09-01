import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

import Session from './Session';
import User from './User';

@Table({
    timestamps: false,
    tableName: 'tokens'
})
class Token extends Model {
    @Column({
        type: DataType.TEXT
    })
    token: string;

    @ForeignKey(() => User)
    @Column
    userId: number;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => Session)
    @Column
    sessionId: number;

    @BelongsTo(() => Session)
    session: Session;
}

export default Token;
