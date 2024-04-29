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
import { MessageDTO, MessageReader } from 'types/messenger';
import UserMessage from './UserMessage';
import MessageRead from './MessageRead';

@Table({
    timestamps: true,
    tableName: 'messages'
})
class Message extends Model {
    @Column({
        type: DataType.TEXT
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

    @HasMany(() => MessageRead, {
        onDelete: 'CASCADE'
    })
    messageReads: MessageRead[];

    async toDTO(): Promise<MessageDTO> {
        const {
            id,
            messageTypeId,
            message,
            createdAt,
            updatedAt,
            senderId,
            chatId
        } = this.get();

        const messageType = await MessageType.findByPk(messageTypeId);

        const sender = await User.findByPk(senderId);

        const readCount = await MessageRead.count({ where: { messageId: id } });

        return {
            id,
            message,
            type: messageType.get('type'),
            createdAt,
            updatedAt,
            isEdited: createdAt.toString() != updatedAt.toString(),
            sender: sender ? sender.toPreview() : null,
            readCount,
            chatId
        };
    }

    async getReaders(): Promise<MessageReader[]> {
        const messageReads = await MessageRead.findAll({
            where: { messageId: this.get('id') }
        });

        return await Promise.all(
            messageReads.map(async messageRead => {
                const { userId, createdAt: date } = messageRead.toJSON();

                const user = (await User.findByPk(userId)).toPreview();

                return {
                    user,
                    date
                };
            })
        );
    }
}

export default Message;
