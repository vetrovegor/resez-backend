import { MessageDTO, MessageTypes } from "types/messenger";
import Message from "../../db/models/messenger/Message";
import chatService from "./chatService";
import messageTypeService from "./messageTypeService";

class MessageService {
    async createMessage(messageType: string, message: string, chatId: number, senderId: number = null): Promise<Message> {
        const messageTypeId = await messageTypeService.getMessageTypeIdByType(messageType);

        return await Message.create({
            messageTypeId,
            message,
            chatId,
            senderId
        });
    }

    async sendMessageToUser(senderId: number, recipientId: number, message: string): Promise<MessageDTO> {
        const chat = await chatService.createOrGetChatBetweenUsers(senderId, recipientId);

        const createdMessage = await this.createMessage(
            MessageTypes.Default,
            message,
            chat.get('id'),
            senderId
        );

        return createdMessage.toDTO();
    }

    async sendMessageToChat(senderId: number, chatId: number, message: string): Promise<MessageDTO> {
        const isUserInChat = await chatService.checkUserInChat(chatId, senderId);

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
}

export default new MessageService();