import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';

import User from '../User';
import Chat from './Chat';
import MessageType from './MessageType';
import { MessageDTO } from 'types/messenger';
import UserMessage from './UserMessage';

@Table({
    timestamps: true,
    tableName: "messages"
})
class Message extends Model {
    @Column({
        type: DataType.TEXT,
    })
    message: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
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

    @HasMany(() => UserMessage, {
        onDelete: 'CASCADE'
    })
    userMessages: UserMessage[];

    // добавить тип сообщения?
    async toDTO(): Promise<MessageDTO> {
        const { id, messageTypeId, message, createdAt, updatedAt, senderId, chatId } = this.get();

        const messageType = await MessageType.findByPk(messageTypeId);

        const sender = await User.findByPk(senderId);

        return {
            id,
            message,
            type: messageType.get('type'),
            createdAt,
            updatedAt,
            isEdited: createdAt.toString() != updatedAt.toString(),
            sender: sender ? sender.toPreview() : null,
            chatId
        }
    }
}

export default Message;