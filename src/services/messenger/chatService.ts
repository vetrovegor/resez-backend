import { Op } from 'sequelize';
import { UploadedFile } from 'express-fileupload';

import { ApiError } from '../../ApiError';
import Chat from '../../db/models/messenger/Chat';
import UserChat from '../../db/models/messenger/UserChat';
import { PaginationDTO } from '../../dto/PaginationDTO';
import messageService from './messageService';
import userService from '../../services/userService';
import { ChatDTO, MessageTypes } from 'types/messenger';
import { UserPreview } from 'types/user';

class ChatService {
    async createUserChat(chatId: number, userId: number): Promise<UserChat> {
        return await UserChat.create({
            chatId,
            userId
        });
    }

    async createChat(
        userIDs: number[],
        chat: string = null,
        isGroup: boolean = false,
        picture: string = null,
        adminId: number = null
    ): Promise<Chat> {
        const validatedUserIDs = await userService.validateUserIDs(userIDs);

        const createdChat = await Chat.create({
            chat,
            isGroup,
            picture,
            adminId
        });

        for (const userId of validatedUserIDs) {
            await this.createUserChat(createdChat.get('id'), userId);
        }

        return createdChat;
    }

    async getChatById(chatId: number): Promise<Chat> {
        const chat = await Chat.findByPk(chatId);

        if (!chat) {
            this.throwChatNotFoundError();
        }

        return chat;
    }

    async checkUserInChat(chatId: number, userId: number): Promise<boolean> {
        await this.getChatById(chatId);

        const userChat = await UserChat.findOne({
            where: {
                userId,
                chatId
            }
        });

        return !!userChat;
    }

    async createOrGetChatBetweenUsers(
        senderId: number,
        recipientId: number
    ): Promise<Chat> {
        // обработать senderId == recipientId
        // // у чата 1 участник, adminId == userId, isFavorites == true
        if (senderId == recipientId) {
            throw ApiError.badRequest('Избранного пока что нет :(');
        }

        const [senderChats, recipientChats] = await Promise.all([
            UserChat.findAll({ where: { userId: senderId } }),
            UserChat.findAll({ where: { userId: recipientId } })
        ]);

        const senderChatIDs = senderChats.map(userChat =>
            userChat.get('chatId')
        );

        const recipientChatIDs = recipientChats.map(userChat =>
            userChat.get('chatId')
        );

        const mutualChatIDs = senderChatIDs.filter(userChat =>
            recipientChatIDs.includes(userChat)
        );

        for (const chatId of mutualChatIDs) {
            const chat = await this.getChatById(chatId);
            const isGroup = chat.get('isGroup');
            const membersCount = await chat.getMembersCount();

            if (!isGroup && membersCount == 2) {
                return chat;
            }
        }

        return await this.createChat([senderId, recipientId]);
    }

    async getUserChats(
        userId: number,
        limit: number,
        offset: number
    ): Promise<PaginationDTO<ChatDTO>> {
        const userChats = await UserChat.findAll({
            where: {
                userId
            }
        });

        const userChatIDs = userChats.map(userChat => userChat.get('chatId'));

        const chats = await Chat.findAll({
            where: {
                id: { [Op.in]: userChatIDs }
            },
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const chatDTOs = await Promise.all(
            chats.map(async chatItem => {
                const { id, isGroup, chat, picture } = chatItem.toJSON();

                const membersCount = await chatItem.getMembersCount();
                const lastMessage = await messageService.getLastMessageByChatId(
                    id
                );

                if (isGroup) {
                    return {
                        id,
                        isGroup,
                        chat,
                        picture,
                        membersCount,
                        lastMessage
                    };
                } else {
                    const chatMembers = await UserChat.findAll({
                        where: {
                            chatId: id
                        }
                    });

                    const chatMemberIDs = chatMembers.map(chatMember =>
                        chatMember.get('userId')
                    );

                    const friendId = chatMemberIDs.find(
                        element => element !== userId
                    );

                    const friend = await userService.getUserById(friendId);
                    const friendPreview = friend.toPreview();

                    return {
                        id,
                        isGroup,
                        chat: friendPreview.nickname,
                        picture: friendPreview.avatar,
                        membersCount,
                        lastMessage
                    };
                }
            })
        );

        const totalCount = await Chat.count({
            where: {
                id: { [Op.in]: userChatIDs }
            }
        });

        return new PaginationDTO<ChatDTO>(
            'chats',
            chatDTOs,
            totalCount,
            limit,
            offset
        );
    }

    async createGroup(
        chat: string,
        userIDs: number[],
        picture: UploadedFile,
        adminId: number
    ): Promise<Chat> {
        // добавить сохранение файла
        // вынести сохранение файла в отдельный сервис?
        userIDs.push(adminId);

        const group = await this.createChat(userIDs, chat, true, null, adminId);

        const admin = await userService.getUserById(adminId);

        await messageService.createMessage(
            MessageTypes.System,
            `${admin.get('nickname')} создал группу ${chat}`,
            group.get('id')
        );

        return group;
    }

    // вынести в мидлвейр проверку что чат есть и является группой
    // тот кто добавляет является админом
    async addUserToChat(
        chatId: number,
        userId: number,
        adminId: number
    ): Promise<UserPreview> {
        const chat = await this.getChatById(chatId);

        if (!chat.get('isGroup')) {
            this.throwChatNotFoundError();
        }

        if (chat.get('adminId') != adminId) {
            throw ApiError.forbidden();
        }

        const user = await userService.getUserById(userId);

        const isUserInChat = await this.checkUserInChat(chatId, userId);

        if (isUserInChat) {
            throw ApiError.badRequest('Пользователь уже состоит в чате');
        }

        await this.createUserChat(chatId, userId);

        const admin = await userService.getUserById(adminId);

        await messageService.createMessage(
            MessageTypes.System,
            `${admin.get('nickname')} пригласил ${user.get('nickname')}`,
            chatId
        );

        return user.toPreview();
    }

    // вынести в мидлвейр проверку что чат есть и является группой
    // тот кто добавляет является админом
    async removeUserFromChat(
        chatId: number,
        userId: number,
        adminId: number
    ): Promise<UserPreview> {
        if (userId == adminId) {
            throw ApiError.badRequest('Нельзя исключить из чата самого себя');
        }

        const chat = await this.getChatById(chatId);

        if (!chat.get('isGroup')) {
            this.throwChatNotFoundError();
        }

        if (chat.get('adminId') != adminId) {
            throw ApiError.forbidden();
        }

        const user = await userService.getUserById(userId);

        const isUserInChat = await this.checkUserInChat(chatId, userId);

        if (!isUserInChat) {
            throw ApiError.badRequest('Пользователь не состоит в чате');
        }

        await UserChat.destroy({
            where: {
                chatId,
                userId
            }
        });

        const admin = await userService.getUserById(adminId);

        await messageService.createMessage(
            MessageTypes.System,
            `${admin.get('nickname')} исключил ${user.get('nickname')}`,
            chatId
        );

        return user.toPreview();
    }

    async getChatInfo(chatId: number) {
        const messages = await messageService.getChatMessages(chatId);

        return { messages };
    }

    throwChatNotFoundError() {
        throw ApiError.notFound('Чат не найден');
    }
}

export default new ChatService();
