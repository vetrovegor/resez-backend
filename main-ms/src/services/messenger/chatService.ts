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
import fileService from '../../services/fileService';
import { generateInviteLink } from '../../utils';
import { redisClient } from '../../redisClient';
import rmqService from '../../services/rmqService';
import { Queues } from '../../enums/rmq';

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
            inviteLink: isGroup ? generateInviteLink() : null,
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

    async getUserChat(userId: number, chatId: number): Promise<UserChat> {
        return await UserChat.findOne({
            where: { userId, chatId }
        });
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
        const { id, isGroup, chat, picture, inviteLink, adminId } =
            chatData.toJSON();

        const isAdmin = forUserId == adminId;

        const membersCount = await chatData.getMembersCount();

        const { isLeft, isKicked } = (
            await UserChat.findOne({
                where: { chatId: id, userId: forUserId }
            })
        ).toJSON();

        const lastMessage = await messageService.getLastMessageByChatId(
            id,
            forUserId
        );

        if (isGroup) {
            return {
                id,
                isGroup,
                chat,
                isLeft,
                isKicked,
                picture:
                    isLeft || isKicked
                        ? null
                        : picture
                        ? process.env.STATIC_URL + picture
                        : null,
                inviteLink,
                isAdmin,
                membersCount: isLeft || isKicked ? null : membersCount,
                lastMessage
            };
        }
        const chatMemberIDs = await chatData.getChatMemberIDs();

        const userId = chatMemberIDs.find(element => element !== forUserId);

        const user = (await userService.getUserById(userId)).toPreview();

        const activity = await rmqService.sendToQueue(
            Queues.Socket,
            'user-activity',
            user.id
        );

        return {
            id,
            isGroup,
            userId,
            chat: user.nickname,
            picture: user.avatar,
            activity,
            inviteLink,
            isAdmin,
            membersCount,
            lastMessage
        };
    }

    // тестовое кеширование
    async getUserChats(
        userId: number,
        limit: number,
        offset: number
    ): Promise<PaginationDTO<ChatDTO>> {
        // const cache = await redisClient.get(
        //     JSON.stringify({ req: 'user_chats', userId, limit, offset })
        // );

        // if (cache) {
        //     return JSON.parse(cache);
        // }

        const userChatIDs = await messageService.getUniqueChatIds(
            userId,
            limit
        );

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

        const result = new PaginationDTO<ChatDTO>(
            'chats',
            chatDTOs,
            totalCount,
            limit,
            offset
        );

        // await redisClient.set(
        //     JSON.stringify({ req: 'user_chats', userId, limit, offset }),
        //     JSON.stringify(result),
        //     { EX: 5 }
        // );

        return result;
    }

    async createGroup(
        chat: string,
        userIDs: number[],
        picture: UploadedFile,
        adminId: number
    ) {
        const picturePath = picture
            ? await fileService.saveFile('chats', picture)
            : null;

        const createdChat = await this.createChat(
            userIDs,
            chat,
            true,
            picturePath,
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

    async setPicture(chatId: number, picture: UploadedFile, userId: number) {
        const chat = await this.getChatById(chatId);

        if (!chat.get('isGroup')) {
            throw ApiError.badRequest('Чат не является группой');
        }

        await fileService.deleteFile(chat.get('picture'));

        const picturePath = await fileService.saveFile('chats', picture);

        chat.set('picture', picturePath);
        await chat.save();

        return await this.createChatDto(chat, userId);
    }

    async deletePicture(chatId: number, userId: number) {
        const chat = await this.getChatById(chatId);

        if (!chat.get('isGroup')) {
            throw ApiError.badRequest('Чат не является группой');
        }

        await fileService.deleteFile(chat.get('picture'));

        chat.set('picture', null);
        await chat.save();

        return await this.createChatDto(chat, userId);
    }

    // вынести в мидлвейр проверку что чат есть и является группой
    // тот кто добавляет является админом
    async addUserToChat(
        chatId: number,
        userId: number,
        adminId: number,
        showHistory: boolean
    ): Promise<UserPreview> {
        const chat = await this.getChatById(chatId);

        if (!chat.get('isGroup')) {
            this.throwChatNotFoundError();
        }

        if (chat.get('adminId') != adminId) {
            throw ApiError.forbidden();
        }

        const userChat = await this.getUserChat(userId, chatId);

        if (userChat && !userChat.get('isKicked')) {
            throw ApiError.badRequest('Пользователь уже состоит в чате');
        }

        if (userChat.get('isKicked')) {
            userChat.set('isKicked', false);
            await userChat.save();
        } else {
            await this.createUserChat(chatId, userId);
        }

        // добавить сообщения для пользователя
        if (showHistory) {
            messageService.createMessagesHistory(chatId, userId);
        }

        const admin = await userService.getUserById(adminId);
        const user = await userService.getUserById(userId);

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

        const userChat = await this.getUserChat(userId, chatId);

        if (userChat.get('isKicked')) {
            throw ApiError.badRequest('Пользователь уже исключен из чата');
        }

        await messageService.clearMessageHistory(chatId, userId);

        const admin = await userService.getUserById(adminId);
        const user = await userService.getUserById(userId);

        await messageService.createMessage(
            MessageTypes.System,
            `${admin.get('nickname')} исключил ${user.get('nickname')}`,
            chatId
        );

        userChat.set('isKicked', true);
        await userChat.save();

        return user.toPreview();
    }

    // тестовое кеширование
    async getChatInfo(chatId: number, userId: number) {
        // const cache = await redisClient.get(
        //     JSON.stringify({ req: 'chat_info', chatId, userId })
        // );

        // if (cache) {
        //     return JSON.parse(cache);
        // }

        const chatData = await this.checkUserInChat(chatId, userId);

        if (!chatData) {
            this.throwChatNotFoundError();
        }

        const messages = await messageService.getChatMessages(chatId, userId);

        const result = {
            chat: await this.createChatDto(chatData, userId),
            messages
        };

        // await redisClient.set(
        //     JSON.stringify({ req: 'chat_info', chatId, userId }),
        //     JSON.stringify(result),
        //     { EX: 5 }
        // );

        return result;
    }

    async getChatUsers(chatId: number, limit: number, offset: number) {
        const chat = await this.getChatById(chatId);

        const userIDs = await chat.getChatMemberIDs();

        const adminId = chat.get('adminId');

        const filteredUserIDs = userIDs.filter(id => id != adminId);

        const usersData = await userService.getUsersByUserIDs(
            filteredUserIDs,
            limit - 1,
            offset
        );

        const users = await Promise.all(
            usersData.map(async user => {
                const userPreview = user.toPreview();

                const activity = await rmqService.sendToQueue(
                    Queues.Socket,
                    'user-activity',
                    user.id
                );

                return {
                    ...userPreview,
                    activity,
                    isAdmin: false
                };
            })
        );

        if (userIDs.includes(adminId)) {
            const adminPreview = (
                await userService.getUserById(adminId)
            ).toPreview();

            const activity = await rmqService.sendToQueue(
                Queues.Socket,
                'user-activity',
                adminId
            );

            users.unshift({
                ...adminPreview,
                activity,
                isAdmin: true
            });
        }

        return new PaginationDTO('users', users, userIDs.length, limit, offset);
    }

    async getChatByInviteLink(userId: number, inviteLink: string) {
        const chat = await Chat.findOne({
            where: { inviteLink }
        });

        if (!chat) {
            this.throwChatNotFoundError();
        }

        return await this.createChatDto(chat, userId);
    }

    async joinChatViaLink(userId: number, inviteLink: string) {
        const existedChat = await Chat.findOne({
            where: { inviteLink }
        });

        if (!existedChat) {
            this.throwChatNotFoundError();
        }

        const chatId = existedChat.get('id');

        const isUserInChat = await this.checkUserInChat(chatId, userId);

        if (isUserInChat) {
            return await this.getChatInfo(chatId, userId);
        }

        await this.createUserChat(chatId, userId);

        const user = (await userService.getUserById(userId)).toPreview();

        await messageService.createMessage(
            MessageTypes.System,
            `${user.nickname} вступил(а) в группу по ссылке-приглашению`,
            chatId
        );

        return await this.getChatInfo(chatId, userId);
    }

    async leaveChat(chatId: number, userId: number, clearHistory: string) {
        const chat = await this.checkUserInChat(chatId, userId);

        if (!chat) {
            throw ApiError.badRequest('Пользователь не состоит в чате');
        }

        if (!chat.get('isGroup')) {
            throw ApiError.badRequest('Можно покинуть только групповой чат');
        }

        const userChat = await this.getUserChat(userId, chatId);

        if (userChat.get('isLeft')) {
            throw ApiError.badRequest('Вы уже покинули чат');
        }

        const user = (await userService.getUserById(userId)).toPreview();

        await messageService.createMessage(
            MessageTypes.System,
            `${user.nickname} покинул чат`,
            chatId
        );

        userChat.set('isLeft', true);
        await userChat.save();

        if (clearHistory && clearHistory.toLowerCase() === 'true') {
            await messageService.clearMessageHistory(chatId, userId);
        }

        return this.createChatDto(chat, userId);
    }

    async returnToChat(chatId: number, userId: number) {
        const chat = await this.checkUserInChat(chatId, userId);

        if (!chat) {
            throw ApiError.badRequest('Пользователь не состоит в чате');
        }

        if (!chat.get('isGroup')) {
            throw ApiError.badRequest('Можно вернуться только групповой чат');
        }

        const userChat = await this.getUserChat(userId, chatId);

        if (!userChat.get('isLeft')) {
            throw ApiError.badRequest('Вы состоите в чате');
        }

        userChat.set('isLeft', false);
        await userChat.save();

        const user = (await userService.getUserById(userId)).toPreview();

        await messageService.createMessage(
            MessageTypes.System,
            `${user.nickname} вернулся чат`,
            chatId
        );

        return this.createChatDto(chat, userId);
    }

    async clearHistory(chatId: number, userId: number) {
        const chat = await this.checkUserInChat(chatId, userId);

        if (!chat) {
            throw ApiError.badRequest('Пользователь не состоит в чате');
        }

        await messageService.clearMessageHistory(chatId, userId);

        return await this.createChatDto(chat, userId);
    }

    throwChatNotFoundError() {
        throw ApiError.notFound('Чат не найден');
    }
}

export default new ChatService();
