import { Op } from 'sequelize';
import { UploadedFile } from 'express-fileupload';

import { ApiError } from '../../ApiError';
import Chat from '../../db/models/messenger/Chat';
import UserChat from '../../db/models/messenger/UserChat';
import { PaginationDTO } from '../../dto/PaginationDTO';
import messageService from './messageService';
import userService from '../../services/userService';
import { ChatDTO, MessageTypes } from 'types/messenger';
import { UserChatPreview, UserPreview } from 'types/user';

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
    ) {
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

    async checkUserInChat(chatId: number, userId: number): Promise<Chat> {
        const chat = await this.getChatById(chatId);

        const userChat = await UserChat.findOne({
            where: {
                userId,
                chatId
            }
        });

        return userChat ? chat : null;
    }

    async createOrGetChatBetweenUsers(senderId: number, recipientId: number) {
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

    // типизировать
    async createChatDto(chatData: Chat, forUserId: number) {
        const { id, isGroup, chat, picture } = chatData.toJSON();

        const membersCount = await chatData.getMembersCount();
        const lastMessage = await messageService.getLastMessageByChatId(id);

        if (isGroup) {
            return {
                id,
                isGroup,
                chat,
                picture,
                membersCount,
                lastMessage
            };
        }
        const chatMemberIDs = await chatData.getChatMemberIDs();

        const friendId = chatMemberIDs.find(element => element !== forUserId);

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

    // довести до ума чтобы изначально получать чаты по новым сообщениями
    // искать последние сообщения по уникальным чатам
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
            limit,
            offset
        });

        const chatDTOs = await Promise.all(
            chats.map(
                async chatItem => await this.createChatDto(chatItem, userId)
            )
        );

        chatDTOs.sort((a, b) => {
            return (
                b.lastMessage.createdAt.getTime() -
                a.lastMessage.createdAt.getTime()
            );
        });

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
    ) {
        if (!userIDs) {
            userIDs = [];
        }

        // добавить сохранение файла
        // вынести сохранение файла в отдельный сервис?
        userIDs.push(adminId);

        const createdChat = await this.createChat(
            userIDs,
            chat,
            true,
            null,
            adminId
        );

        const admin = await userService.getUserById(adminId);

        await messageService.createMessage(
            MessageTypes.System,
            `${admin.get('nickname')} создал группу «${chat}»`,
            createdChat.get('id')
        );

        return this.createChatDto(createdChat, adminId);
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

    async getChatInfo(chatId: number, userId: number) {
        const chatData = await this.checkUserInChat(chatId, userId);

        if (!chatData) {
            this.throwChatNotFoundError();
        }

        const messages = await messageService.getChatMessages(chatId);

        return {
            chat: await this.createChatDto(chatData, userId),
            messages
        };
    }

    async getChatUsers(
        chatId: number,
        limit: number,
        offset: number
    ): Promise<PaginationDTO<UserChatPreview>> {
        const chat = await this.getChatById(chatId);

        const userIDs = await chat.getChatMemberIDs();

        const adminId = chat.get('adminId');

        const filteredUserIDs = userIDs.filter(id => id != adminId);

        const usersData = await userService.getUsersByUserIDs(
            filteredUserIDs,
            limit - 1,
            offset
        );

        const users: UserChatPreview[] = usersData.map(user => {
            const userPreview = user.toPreview();

            return {
                ...userPreview,
                isAdmin: false
            };
        });

        const adminPreview = (
            await userService.getUserById(adminId)
        ).toPreview();

        users.unshift({
            ...adminPreview,
            isAdmin: true
        });

        return new PaginationDTO('users', users, userIDs.length, limit, offset);
    }

    throwChatNotFoundError() {
        throw ApiError.notFound('Чат не найден');
    }
}

export default new ChatService();
