import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    HasMany
} from 'sequelize-typescript';

import User from '../User';
import Chat from './Chat';
import MessageType from './MessageType';
import UserMessage from './UserMessage';
import MessageFile from './MessageFile';
import { MessageTypes } from '@enums/messenger';

@Table({
    timestamps: true,
    tableName: 'messages'
})
class Message extends Model {
    @Column({
        type: DataType.TEXT
    })
    message: string;

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

    @Column({
        type: DataType.ENUM(...Object.values(MessageTypes))
    })
    type: MessageTypes;

    @ForeignKey(() => MessageType)
    @Column
    messageTypeId: number;

    @BelongsTo(() => MessageType)
    messageType: MessageType;

    @HasMany(() => UserMessage, {
        onDelete: 'CASCADE'
    })
    userMessages: UserMessage[];

    @HasMany(() => MessageFile, {
        onDelete: 'CASCADE'
    })
    messageFiles: MessageFile[];

    @ForeignKey(() => Message)
    @Column({
        type: DataType.INTEGER
    })
    parentMessageId: number;

    @BelongsTo(() => Message)
    parentMessage: Message;

    @HasMany(() => Message)
    replies: Message[];
}

export default Message;
