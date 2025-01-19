import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UploadedFile } from 'express-fileupload';

import {
    MessageDTO,
    MessageFileDTO,
    MessageFileRequestBodyDTO
} from 'src/types/messenger';
import Message from '@db/models/messenger/Message';
import chatService from './chatService';
import { ApiError } from '@ApiError';
import { EmitTypes } from '@enums/socket';
import UserMessage from '@db/models/messenger/UserMessage';
import rmqService from '@services/rmqService';
import { Queues } from '@enums/rmq';
import messageFileService from './messageFileService';
import { formatFileSize } from '@utils';
import { MessageTypes } from '@enums/messenger';
import { PaginationDTO } from '../../dto/PaginationDTO';

class MessageService {
    private messageInclude = [
        { association: 'sender', attributes: ['id', 'nickname', 'avatar'] },
        {
            association: 'userMessages',
            attributes: ['isRead', 'userId', 'readDate', 'reactionDate'],
            include: [
                {
                    association: 'user',
                    attributes: ['id', 'nickname', 'avatar']
                }
            ]
        },
        {
            association: 'messageFiles',
            attributes: ['id', 'url', 'name', 'type', 'size']
        },
        {
            association: 'parentMessage',
            attributes: ['id', 'message'],
            include: [
                {
                    association: 'sender',
                    attributes: ['id', 'nickname', 'avatar']
                },
                {
                    association: 'messageFiles',
                    attributes: ['id', 'url', 'name', 'type', 'size']
                }
            ]
        }
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

    createParentMessageDto(messageData: Message) {
        const { id, message } = messageData.toJSON();

        const sender = messageData.get('sender').toPreview();

        const files = messageData
            .get('messageFiles')
            .map(messageFile =>
                messageFileService.createMessageFileDto(messageFile)
            );

        return {
            id,
            message,
            sender,
            files
        };
    }

    createMessageDto(messageData: Message, forUserId: number): MessageDTO {
        const {
            id,
            message,
            type,
            createdAt,
            updatedAt,
            chatId,
            parentMessageId
        } = messageData.toJSON();

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

        const reactions = messageData
            .get('userMessages')
            .filter(userMessage => !!userMessage.get('reaction'))
            .map(userMessage => ({
                ...userMessage.get('user').toPreview(),
                reaction: userMessage.get('reaction'),
                reactionDate: userMessage.get('reactionDate')
            }));

        const files = messageData
            .get('messageFiles')
            .map(messageFile =>
                messageFileService.createMessageFileDto(messageFile)
            );

        const parentMessage = parentMessageId
            ? this.createParentMessageDto(messageData.get('parentMessage'))
            : null;

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
            reactions,
            chatId,
            files,
            parentMessage
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
        files: MessageFileRequestBodyDTO[] = [],
        parentMessageId?: number
    ): Promise<MessageDTO> {
        const createdMessage = await Message.create({
            type,
            message,
            chatId,
            senderId,
            parentMessageId
        });

        await messageFileService.createMessageFiles(
            createdMessage.get('id'),
            files
        );

        const chatUserIds = await chatService.getChatUserIds(chatId);

        chatUserIds.forEach(async userId => {
            await this.createUserMessage(
                userId,
                createdMessage.get('id'),
                chatId
            );
        });

        const messageDto = await this.createMessageDtoById(
            createdMessage.get('id'),
            senderId
        );

        // TODO: отфильтравить chatUserIds isLeft, isKicked = false
        rmqService.sendToQueue(Queues.Socket, 'emit-to-users', {
            userIds: chatUserIds.filter(userId => userId != senderId),
            emitType: EmitTypes.Message,
            data: messageDto
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
        nickname: string,
        chatId: number,
        message: string,
        files: MessageFileRequestBodyDTO[],
        parentMessageId: number
    ): Promise<MessageDTO> {
        const userChat = await chatService.getUserChat(senderId, chatId);

        if (!userChat) {
            chatService.throwChatNotFoundError();
        }

        if (userChat.get('isKicked')) {
            throw ApiError.badRequest('Вы были исключены из чата');
        }

        if (userChat.get('isLeft')) {
            await chatService.returnToChat(chatId, senderId, nickname);
        }

        if (parentMessageId != undefined) {
            // TODO: проверять что тип у сообщения не System
            const userMessage = await UserMessage.findOne({
                where: {
                    userId: senderId,
                    messageId: parentMessageId,
                    chatId: userChat.get('chatId')
                }
            });

            if (!userMessage) {
                this.throwMessageNotFoundError();
            }
        }

        return await this.createMessage(
            MessageTypes.DEFAULT,
            message,
            chatId,
            senderId,
            files,
            parentMessageId
        );
    }

    // async getLastMessageByChatId(
    //     chatId: number,
    //     userId: number
    // ): Promise<MessageDTO> {
    //     const lastUserMessage = await UserMessage.findOne({
    //         where: { chatId, userId },
    //         include: {
    //             association: 'message',
    //             include: this.messageInclude
    //         },
    //         order: [['createdAt', 'DESC']]
    //     });

    //     return lastUserMessage
    //         ? this.createMessageDto(lastUserMessage.get('message'), userId)
    //         : null;
    // }

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

        messageData.set('message', message);
        await messageData.save();

        const messageDto = this.createMessageDto(messageData, userId);

        chatService.notifyChatUsers(
            messageData.get('chatId'),
            userId,
            EmitTypes.MessageUpdating,
            messageDto
        );

        return messageDto;
    }

    async deleteMessage(
        userId: number,
        messageIds: number[],
        forAll: any
    ): Promise<void> {
        if (!Array.isArray(messageIds)) {
            messageIds = [messageIds];
        }

        let chatId: number = null;

        forAll = forAll && forAll.toLowerCase() === 'true';

        for (const messageId of messageIds) {
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

        for (const messageId of messageIds) {
            if (forAll) {
                // await messageFileService.deleteMessageFilesByMessageId(messageId);
                await Message.destroy({ where: { id: messageId } });
            } else {
                UserMessage.destroy({
                    where: { messageId, userId }
                });
            }
        }

        if (forAll) {
            chatService.notifyChatUsers(
                chatId,
                userId,
                EmitTypes.MessagesDeleting,
                { messageIds }
            );
        }
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

    async readMessage(chatId: number, userId: number, date: Date) {
        const messagesToRead = await Message.findAll({
            where: {
                chatId,
                createdAt: {
                    [Op.lte]: date
                },
                [Op.or]: [
                    {
                        senderId: {
                            [Op.ne]: userId
                        }
                    },
                    { senderId: null }
                ]
            },
            order: [['createdAt', 'DESC']]
        });

        const messagesToReadIds = messagesToRead.map(message =>
            message.get('id')
        );

        const [affectedCount] = await UserMessage.update(
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

        if (affectedCount > 0) {
            chatService.notifyChatUsers(
                chatId,
                userId,
                EmitTypes.MessageReading,
                { messageId: messagesToRead[0].get('id') }
            );
        }
    }

    async readPreviousMessages(messageId: number, userId: number) {
        const message = await this.getMessageById(messageId);

        return await this.readMessage(
            message.get('chatId'),
            userId,
            message.get('createdAt')
        );
    }

    async readAllMessages(messageId: number, userId: number) {
        const message = await this.getMessageById(messageId);

        return await this.readMessage(
            message.get('chatId'),
            userId,
            new Date()
        );
    }

    async setReactionToMessage(
        messageId: number,
        userId: number,
        reaction: string
    ) {
        const userMessage = await UserMessage.findOne({
            where: {
                messageId,
                userId
            }
        });

        if (!userMessage) {
            this.throwMessageNotFoundError();
        }

        const isEqual = userMessage.get('reaction') == reaction;

        const finalReaction = isEqual ? null : reaction;
        const reactionDate = isEqual ? null : new Date();

        userMessage.set('reaction', finalReaction);
        userMessage.set('reactionDate', reactionDate);

        await userMessage.save();

        const messageDto = await this.createMessageDtoById(messageId, userId);

        chatService.notifyChatUsers(
            messageDto.chatId,
            userId,
            EmitTypes.MessageUpdating,
            messageDto
        );
    }

    async getOrderedChatsData(userId: number, limit: number, offset: number) {
        return await UserMessage.findAndCountAll({
            attributes: ['chatId'],
            group: ['chatId'],
            order: [[Sequelize.fn('MAX', 'createdAt'), 'DESC']],
            where: { userId },
            limit,
            offset
        });
    }

    async getMessagesByChatId(
        chatId: number,
        userId: number,
        limit: number,
        offset: number
    ) {
        const messagesData = await Message.findAll({
            include: [
                ...this.messageInclude,
                {
                    association: 'userMessages',
                    include: [{ association: 'user' }],
                    where: { chatId }
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const messages = messagesData
            .reverse()
            .map(messageData => this.createMessageDto(messageData, userId));

        const totalCount = await UserMessage.count({
            where: { chatId, userId }
        });

        return new PaginationDTO(
            'messages',
            messages,
            totalCount,
            limit,
            offset
        );
    }

    throwMessageNotFoundError() {
        throw ApiError.notFound('Сообщение не найдено');
    }
}

export default new MessageService();
