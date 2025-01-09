import { Op } from 'sequelize';
import { UploadedFile } from 'express-fileupload';

import {
    MessageDTO,
    MessageFileDTO,
    MessageFileRequestBodyDTO
} from 'src/types/messenger';
import Message from '@db/models/messenger/Message';
import chatService from './chatService';
import { ApiError } from '../../ApiError';
import { EmitTypes } from '@enums/socket';
import UserMessage from '@db/models/messenger/UserMessage';
import rmqService from '@services/rmqService';
import { Queues } from '@enums/rmq';
import messageFileService from './messageFileService';
import { formatFileSize } from '@utils';
import { MessageTypes } from '@enums/messenger';

class MessageService {
    private messageInclude = [
        { association: 'sender' },
        {
            association: 'userMessages',
            include: [{ association: 'user' }]
        },
        { association: 'messageFiles' }
    ];

    async getMessageById(messageId: number): Promise<Message> {
        const message = await Message.findByPk(messageId, {
            include: this.messageInclude
        });

        if (!message) {
            this.throwMessageNotFoundError();
        }

        return message;
    }

    async createUserMessage(userId: number, messageId: number, chatId: number) {
        return await UserMessage.create({
            userId,
            messageId,
            chatId
        });
    }

    createMessageDto(messageData: Message, forUserId: number): MessageDTO {
        const { id, message, type, createdAt, updatedAt, chatId } =
            messageData.toJSON();

        const isEdited = createdAt.toString() != updatedAt.toString();
        const sender = messageData.get('sender');
        const isOwner = sender && sender.get('id') == forUserId;
        const readers = isOwner
            ? messageData
                  .get('userMessages')
                  .filter(
                      userMessage =>
                          userMessage.get('isRead') &&
                          userMessage.get('userId') != forUserId
                  )
                  .map(userMessage => ({
                      ...userMessage.get('user').toPreview(),
                      readDate: userMessage.get('readDate')
                  }))
            : null;
        const isRead = isOwner ? readers.length > 0 : null;
        const files = messageData.get('messageFiles').map(item => {
            const { id, url, name, type, size } = item.toJSON();

            return {
                id,
                url,
                name,
                type,
                size: formatFileSize(size)
            } as MessageFileDTO;
        });

        return {
            id,
            message,
            type,
            createdAt,
            updatedAt,
            isEdited,
            sender: sender?.toPreview() ?? null,
            isRead,
            readers,
            chatId,
            files
        };
    }

    async createMessageDtoById(id: number, forUserId: number) {
        const messageData = await this.getMessageById(id);

        return this.createMessageDto(messageData, forUserId);
    }

    async createMessage(
        type: MessageTypes,
        message: string,
        chatId: number,
        senderId: number = null,
        files: MessageFileRequestBodyDTO[] = []
    ): Promise<MessageDTO> {
        const createdMessage = await Message.create({
            type,
            message,
            chatId,
            senderId
        });

        await messageFileService.createMessageFiles(
            createdMessage.get('id'),
            files
        );

        const messageData = await Message.findByPk(createdMessage.get('id'), {
            include: this.messageInclude
        });

        const messageDto = this.createMessageDto(messageData, senderId);

        const memberIDs = await (
            await chatService.getChatById(chatId)
        ).getChatMemberIDs();

        memberIDs.forEach(async userId => {
            await this.createUserMessage(
                userId,
                createdMessage.get('id'),
                chatId
            );

            rmqService.sendToQueue(Queues.Socket, 'emit-to-user', {
                userId,
                emitType: EmitTypes.Message,
                data: messageDto
            });
        });

        return messageDto;
    }

    async sendMessageToUser(
        senderId: number,
        recipientId: number,
        message: string,
        files: MessageFileRequestBodyDTO[]
    ): Promise<MessageDTO> {
        const chat = await chatService.createOrGetChatBetweenUsers(
            senderId,
            recipientId
        );

        return await this.createMessage(
            MessageTypes.DEFAULT,
            message,
            chat.get('id'),
            senderId,
            files
        );
    }

    async sendMessageToChat(
        senderId: number,
        chatId: number,
        message: string,
        files: MessageFileRequestBodyDTO[]
    ): Promise<MessageDTO> {
        const chat = await chatService.checkUserInChat(chatId, senderId);

        if (!chat) {
            chatService.throwChatNotFoundError();
        }

        const userChat = await chatService.getUserChat(senderId, chatId);

        if (userChat.get('isKicked')) {
            throw ApiError.badRequest('Вы были исключены из чата');
        }

        if (userChat.get('isLeft')) {
            await chatService.returnToChat(chatId, senderId);
        }

        return await this.createMessage(
            MessageTypes.DEFAULT,
            message,
            chatId,
            senderId,
            files
        );
    }

    async getLastMessageByChatId(
        chatId: number,
        userId: number
    ): Promise<MessageDTO> {
        const lastUserMessage = await UserMessage.findOne({
            where: { chatId, userId },
            include: {
                association: 'message',
                include: this.messageInclude
            },
            order: [['createdAt', 'DESC']]
        });

        return lastUserMessage
            ? this.createMessageDto(lastUserMessage.get('message'), userId)
            : null;
    }

    async editMessage(
        messageId: number,
        userId: number,
        message: string
    ): Promise<MessageDTO> {
        // вынести в функцию принадлежит ли сообщение пользователю или в мидлвейр
        const messageData = await this.getMessageById(messageId);

        if (messageData.get('senderId') != userId) {
            this.throwMessageNotFoundError();
        }

        const isUserInChat = await chatService.checkUserInChat(
            messageData.get('chatId'),
            userId
        );

        if (!isUserInChat) {
            this.throwMessageNotFoundError();
        }
        // вынести в функцию принадлежит ли сообщение пользователю или в мидлвейр

        messageData.set('message', message);
        await messageData.save();

        const messageDto = this.createMessageDto(messageData, userId);

        const memberIDs = await (
            await chatService.getChatById(messageData.get('chatId'))
        ).getChatMemberIDs();

        memberIDs.forEach(async userId => {
            rmqService.sendToQueue(Queues.Socket, 'emit-to-user', {
                userId,
                emitType: EmitTypes.Message,
                data: messageDto
            });
        });

        return messageDto;
    }

    async deleteMessage(
        userId: number,
        messageIDs: number[],
        forAll: any
    ): Promise<void> {
        if (!Array.isArray(messageIDs)) {
            messageIDs = [messageIDs];
        }

        let chatId: number = null;

        forAll = forAll && forAll.toLowerCase() === 'true';

        for (const messageId of messageIDs) {
            const messageData = await this.getMessageById(messageId);

            if (messageData.get('senderId') != userId) {
                this.throwMessageNotFoundError();
            }

            // проверять еще что существует UserMessage

            const messageChatId = messageData.get('chatId');

            if (chatId && chatId != messageChatId) {
                throw ApiError.badRequest(
                    'Нельзя одновременно удалять сообщения из разных чатов'
                );
            }

            chatId = messageChatId;

            const userChat = await chatService.getUserChat(userId, chatId);

            if (!userChat) {
                this.throwMessageNotFoundError();
            }

            if (
                (userChat.get('isLeft') && forAll) ||
                (userChat.get('isKicked') && forAll)
            ) {
                throw ApiError.badRequest(
                    'Данное сообщение можно удалить только для себя'
                );
            }
        }

        for (const messageId of messageIDs) {
            if (forAll) {
                // await messageFileService.deleteMessageFilesByMessageId(messageId);
                await Message.destroy({ where: { id: messageId } });
            } else {
                UserMessage.destroy({
                    where: { messageId, userId }
                });
            }
        }

        const memberIDs = await (
            await chatService.getChatById(chatId)
        ).getChatMemberIDs();

        memberIDs.forEach(async userId => {
            rmqService.sendToQueue(Queues.Socket, 'emit-to-user', {
                userId,
                emitType: EmitTypes.Message,
                data: messageIDs
            });
        });
    }

    async getChatMessages(chatId: number, userId: number) {
        const userMessages = await UserMessage.findAll({
            where: { chatId, userId }
        });

        const messageIDs = userMessages.map(userMessage =>
            userMessage.get('messageId')
        );

        const messages = await Message.findAll({
            where: {
                id: { [Op.in]: messageIDs }
            },
            include: this.messageInclude,
            order: [['createdAt', 'ASC']]
        });

        return messages.map(message => this.createMessageDto(message, userId));
    }

    async createMessagesHistory(chatId: number, userId: number): Promise<void> {
        const lastMessages = await Message.findAll({
            where: { chatId }
        });

        for (const message of lastMessages) {
            await this.createUserMessage(userId, message.get('id'), chatId);
        }
    }

    async clearMessageHistory(chatId: number, userId: number) {
        return await UserMessage.destroy({
            where: { chatId, userId }
        });
    }

    async readMessage(messageId: number, userId: number) {
        const message = await this.getMessageById(messageId);

        const messagesToRead = await Message.findAll({
            where: {
                chatId: message.get('chatId'),
                createdAt: {
                    [Op.lte]: message.get('createdAt')
                },
                [Op.or]: [
                    {
                        senderId: {
                            [Op.ne]: userId
                        }
                    },
                    { senderId: null }
                ]
            }
        });

        const messagesToReadIds = messagesToRead.map(message =>
            message.get('id')
        );

        await UserMessage.update(
            {
                isRead: true,
                readDate: new Date()
            },
            {
                where: {
                    isRead: false,
                    messageId: { [Op.in]: messagesToReadIds },
                    userId
                }
            }
        );
    }

    // довести до ума чтобы сразу же запросом отбирались нужные записи
    async getUniqueChatIds(userId: number, limit: number): Promise<number[]> {
        const userMessages = await UserMessage.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        const chatIDs = userMessages.map(message => message.get('chatId'));

        const uniqueChatIDs = [...new Set(chatIDs)];

        return uniqueChatIDs.slice(0, limit);
    }

    throwMessageNotFoundError() {
        throw ApiError.notFound('Сообщение не найдено');
    }
}

export default new MessageService();
