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
import MessageFile from './MessageFile';
import { formatFileSize } from '../../../utils';

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

    @HasMany(() => MessageFile, {
        onDelete: 'CASCADE'
    })
    messageFiles: MessageFile[];

    async toDTO(): Promise<MessageDTO> {
        const messageData = await Message.findByPk(this.get('id'), {
            include: ['messageType', 'sender', 'messageReads', 'messageFiles']
        });

        const { id, message, createdAt, updatedAt, chatId } =
            messageData.toJSON();

        const type = messageData.get('messageType').get('type');
        const isEdited = createdAt.toString() != updatedAt.toString();
        const sender = messageData.get('sender');
        const readsCount = messageData.get('messageReads').length;
        const files = messageData.get('messageFiles').map(item => {
            const { id, type, size, path } = item.toJSON();
            return {
                id,
                type,
                size: formatFileSize(size),
                path: process.env.STATIC_URL + path
            };
        });

        return {
            id,
            message,
            type,
            createdAt,
            updatedAt,
            isEdited,
            sender: sender ? sender.toPreview() : null,
            readsCount,
            chatId,
            files
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
