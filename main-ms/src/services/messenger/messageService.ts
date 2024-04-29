import { Op } from 'sequelize';

import { MessageDTO, MessageTypes } from 'types/messenger';
import Message from '../../db/models/messenger/Message';
import chatService from './chatService';
import messageTypeService from './messageTypeService';
import { ApiError } from '../../ApiError';
import socketService from '../../services/socketService';
import { EmitTypes } from 'types/socket';
import UserMessage from '../../db/models/messenger/UserMessage';
import MessageRead from '../../db/models/messenger/MessageRead';

class MessageService {
    async getMessageById(messageId: number): Promise<Message> {
        const message = await Message.findByPk(messageId);

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

    async createMessage(
        messageType: string,
        message: string,
        chatId: number,
        senderId: number = null
    ): Promise<Message> {
        const messageTypeId = await messageTypeService.getMessageTypeIdByType(
            messageType
        );

        const createdMessage = await Message.create({
            messageTypeId,
            message,
            chatId,
            senderId
        });

        const messageDto = await createdMessage.toDTO();

        const memberIDs = await (
            await chatService.getChatById(chatId)
        ).getChatMemberIDs();

        memberIDs.forEach(async userId => {
            await this.createUserMessage(
                userId,
                createdMessage.get('id'),
                chatId
            );

            socketService.emitByUserId(userId, EmitTypes.Message, messageDto);
        });

        return createdMessage;
    }

    async sendMessageToUser(
        senderId: number,
        recipientId: number,
        message: string
    ): Promise<MessageDTO> {
        const chat = await chatService.createOrGetChatBetweenUsers(
            senderId,
            recipientId
        );

        const createdMessage = await this.createMessage(
            MessageTypes.Default,
            message,
            chat.get('id'),
            senderId
        );

        // const messageDto = await createdMessage.toDTO();

        // socketService.emitByUserId(recipientId, EmitTypes.Message, messageDto);

        return await createdMessage.toDTO();
    }

    async sendMessageToChat(
        senderId: number,
        chatId: number,
        message: string
    ): Promise<MessageDTO> {
        const chat = await chatService.checkUserInChat(chatId, senderId);

        if (!chat) {
            chatService.throwChatNotFoundError();
        }

        const userChat = await chatService.getUserChat(senderId, chatId);

        if (userChat.get('isLeft')) {
            await chatService.returnToChat(chatId, senderId);
        }

        const createdMessage = await this.createMessage(
            MessageTypes.Default,
            message,
            chatId,
            senderId
        );

        // const messageDto = await createdMessage.toDTO();

        // const memberIDs = await chat.getChatMemberIDs();

        // memberIDs.forEach(async userId => {
        //     if (userId != senderId) {
        //         socketService.emitByUserId(
        //             userId,
        //             EmitTypes.Message,
        //             messageDto
        //         );
        //     }
        // });

        return await createdMessage.toDTO();
    }

    async getLastMessageByChatId(chatId: number): Promise<MessageDTO> {
        const message = await Message.findOne({
            where: {
                chatId
            },
            order: [['createdAt', 'DESC']]
        });

        return message ? await message.toDTO() : null;
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

        const messageDto = await messageData.toDTO();

        const memberIDs = await (
            await chatService.getChatById(messageData.get('chatId'))
        ).getChatMemberIDs();

        memberIDs.forEach(async userId => {
            socketService.emitByUserId(userId, EmitTypes.Message, messageDto);
        });

        return messageDto;
    }

    async deleteMessage(
        messageId: number,
        userId: number,
        forAll: string
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

        if (forAll && forAll.toLowerCase() === 'true') {
            await messageData.destroy();
        } else {
            UserMessage.destroy({
                where: { messageId, userId }
            });
        }

        const messageDto = await messageData.toDTO();

        const memberIDs = await (
            await chatService.getChatById(messageData.get('chatId'))
        ).getChatMemberIDs();

        memberIDs.forEach(async userId => {
            socketService.emitByUserId(userId, EmitTypes.Message, messageDto);
        });

        return messageDto;
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
            order: [['createdAt', 'ASC']]
        });

        return await Promise.all(
            messages.map(async message => message.toDTO())
        );
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

        if (message.get('senderId') == userId) {
            throw ApiError.badRequest('Нельзя прочитать свое сообщение');
        }

        const messageRead = await MessageRead.findOne({
            where: { messageId, userId }
        });

        if (messageRead) {
            throw ApiError.badRequest('Сообщение уже прочитано');
        }

        const userMessageReadIDs = (
            await MessageRead.findAll({
                where: { userId }
            })
        ).map(messageRead => messageRead.get('messageId'));

        const unreadMessageIDs = (
            await Message.findAll({
                where: {
                    id: {
                        [Op.notIn]: userMessageReadIDs
                    },
                    createdAt: {
                        [Op.lte]: message.get('createdAt')
                    },
                    senderId: {
                        [Op.ne]: userId
                    },
                    chatId: message.get('chatId')
                }
            })
        ).map(message => message.get('id'));

        for (const messageId of unreadMessageIDs) {
            await MessageRead.create({ messageId, userId });
        }
    }

    async getMessageReaders(messageId: number, userId: number) {
        const message = await this.getMessageById(messageId);

        const isUserInChat = await chatService.checkUserInChat(
            message.get('chatId'),
            userId
        );

        if (!isUserInChat) {
            this.throwMessageNotFoundError();
        }

        return await message.getReaders();
    }

    throwMessageNotFoundError() {
        throw ApiError.notFound('Сообщение не найдено');
    }
}

export default new MessageService();
