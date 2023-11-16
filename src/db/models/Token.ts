import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

import Session from './Session.js';

@Table({
    tableName: 'tokens',
    timestamps: false,
})
class Token extends Model {
    @Column({
        type: DataType.STRING
    })
    token: string;

    @ForeignKey(() => Session)
    @Column
    sessionId: number;

    @BelongsTo(() => Session)
    session: Session;
}

export default Token;
