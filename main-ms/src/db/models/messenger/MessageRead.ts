import { Table, Column, Model, DataType, ForeignKey, HasMany, BelongsTo } from 'sequelize-typescript';

import User from '../User';
import Message from './Message';

@Table({
    timestamps: true,
    tableName: "messages_reads"
})
class MessageRead extends Model {
    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER
    })
    userId: number;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => Message)
    @Column({
        type: DataType.INTEGER
    })
    messageId: number;

    @BelongsTo(() => Message)
    message: Message;
}

export default MessageRead;