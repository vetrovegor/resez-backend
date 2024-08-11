import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

import User from './User';

@Table({
    timestamps: true,
    tableName: "feedback"
})
class Feedback extends Model {
    @Column({
        type: DataType.TEXT,
    })
    text: string;
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isRead: boolean;

    @ForeignKey(() => User)
    @Column
    userId: number;

    @BelongsTo(() => User)
    user: User;
}

export default Feedback;