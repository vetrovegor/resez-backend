import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';

import User from '../User';
import Chat from './Chat';
import MessageType from './MessageType';

@Table({
    timestamps: true,
    tableName: "messages"
})
class Message extends Model {
    @Column({
        type: DataType.STRING,
    })
    message: string;
    
    @Column({
        type: DataType.BOOLEAN,
    })
    isRead: boolean;

    @ForeignKey(() => User)
    @Column
    senderId: number;

    @BelongsTo(() => User)
    sender: User;

    @ForeignKey(() => Chat)
    @Column
    chatId: number;

    @BelongsTo(() => Chat)
    chat: Chat;

    @ForeignKey(() => MessageType)
    @Column
    messageTypeId: number;

    @BelongsTo(() => MessageType)
    messageType: MessageType;
}

export default Message;