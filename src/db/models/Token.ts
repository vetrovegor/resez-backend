import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

import Session from './Session.js';

@Table({
    timestamps: false,
    tableName: 'tokens'
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
