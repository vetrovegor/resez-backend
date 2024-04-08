import { MessageDTO, MessageTypes } from 'types/messenger';
import Message from '../../db/models/messenger/Message';
import chatService from './chatService';
import messageTypeService from './messageTypeService';
import { ApiError } from '../../ApiError';
import { message } from 'telegraf/filters';

class MessageService {
    async getMessageById(messageId: number): Promise<Message> {
        const message = await Message.findByPk(messageId);

        if (!message) {
            this.throwMessageNotFoundError();
        }

        return message;
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

        return await Message.create({
            messageTypeId,
            message,
            chatId,
            senderId
        });
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

        return createdMessage.toDTO();
    }

    async sendMessageToChat(
        senderId: number,
        chatId: number,
        message: string
    ): Promise<MessageDTO> {
        const isUserInChat = await chatService.checkUserInChat(
            chatId,
            senderId
        );

        if (!isUserInChat) {
            chatService.throwChatNotFoundError();
        }

        const createdMessage = await this.createMessage(
            MessageTypes.Default,
            message,
            chatId,
            senderId
        );

        return createdMessage.toDTO();
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

        return messageData.toDTO();
    }

    async deleteMessage(
        messageId: number,
        userId: number
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

        await messageData.destroy();

        return messageData.toDTO();
    }

    async getChatMessages(chatId: number) {
        const messages = await Message.findAll({
            where: { chatId }
        });

        return await Promise.all(
            messages.map(async message => message.toDTO())
        );
    }

    throwMessageNotFoundError() {
        throw ApiError.notFound('Сообщение не найдено');
    }
}

export default new MessageService();
