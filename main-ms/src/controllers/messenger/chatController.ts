import { Response, NextFunction, Request } from 'express';
import { UploadedFile } from 'express-fileupload';

import {
    IdParam,
    PaginationQuery,
    RequestWithBodyAndUser,
    RequestWithParams,
    RequestWithParamsAndBodyAndUser,
    RequestWithParamsAndQuery,
    RequestWithParamsAndQueryAndUser,
    RequestWithParamsAndUser,
    RequestWithQueryAndUser,
    RequestWithUser
} from 'src/types/request';
import { GroupCreateRequestDTO, UserChatParams } from 'src/types/messenger';
import chatService from '@services/messenger/chatService';

class ChatController {
    async getUserChats(
        req: RequestWithQueryAndUser<PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { limit, offset } = req.query;

            const data = await chatService.getUserChats(
                req.user.id,
                limit,
                offset
            );

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    // типизировать запрос, который будет принимать картинку
    async createGroup(
        req: RequestWithBodyAndUser<GroupCreateRequestDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { chat, users } = req.body;

            const picture = req?.files?.picture ? req.files.picture : null;

            const createdChat = await chatService.createGroup(
                chat,
                users,
                picture as UploadedFile,
                req.user.id
            );

            res.json({ chat: createdChat });
        } catch (error) {
            next(error);
        }
    }

    async setPicture(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const chat = await chatService.setPicture(
                req.params.id,
                req.files.picture as UploadedFile,
                req.user.id
            );

            res.json({ chat });
        } catch (error) {
            next(error);
        }
    }

    async deletePicture(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const chat = await chatService.deletePicture(
                req.params.id,
                req.user.id
            );

            res.json({ chat });
        } catch (error) {
            next(error);
        }
    }

    async addUserToChat(
        req: RequestWithParamsAndBodyAndUser<
            UserChatParams,
            { showHistory: boolean }
        >,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { chatId, userId } = req.params;

            await chatService.addUserToChat(
                chatId,
                userId,
                req.user.id,
                req.body.showHistory
            );

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async removeUserFromChat(
        req: RequestWithParamsAndUser<UserChatParams>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { chatId, userId } = req.params;

            await chatService.removeUserFromChat(chatId, userId, req.user.id);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async getUnreadChatsCount(
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ) {
        try {
            const count = await chatService.getUnreadChatsCount(req.user.id);

            res.json({ count });
        } catch (error) {
            next(error);
        }
    }

    async getChatInfo(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const chat = await chatService.getChatInfo(
                req.params.id,
                req.user.id
            );

            res.json({ chat });
        } catch (error) {
            next(error);
        }
    }

    async getChatUsers(
        req: RequestWithParamsAndQuery<IdParam, PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const response = await chatService.getChatUsers(
                req.params.id,
                req.query.limit,
                req.query.offset
            );

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async getChatByInviteLink(
        req: RequestWithParamsAndUser<{ inviteLink: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const chat = await chatService.getChatByInviteLink(
                req.user.id,
                req.params.inviteLink
            );

            res.json({ chat });
        } catch (error) {
            next(error);
        }
    }

    async joinChatViaLink(
        req: RequestWithParamsAndUser<{ inviteLink: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const response = await chatService.joinChatViaLink(
                req.user.id,
                req.user.nickname,
                req.params.inviteLink
            );

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    async leaveChat(
        req: RequestWithParamsAndQueryAndUser<
            IdParam,
            { clear_history: string }
        >,
        res: Response,
        next: NextFunction
    ) {
        try {
            const chat = await chatService.leaveChat(
                req.params.id,
                req.user.id,
                req.user.nickname,
                req.query.clear_history
            );

            res.json({ chat });
        } catch (error) {
            next(error);
        }
    }

    async returnToChat(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const chat = await chatService.returnToChat(
                req.params.id,
                req.user.id,
                req.user.nickname
            );

            res.json({ chat });
        } catch (error) {
            next(error);
        }
    }

    async clearHistory(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const chat = await chatService.clearHistory(
                req.params.id,
                req.user.id
            );

            res.json({ chat });
        } catch (error) {
            next(error);
        }
    }

    async readAllChat(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            await chatService.readAllChat(req.params.id, req.user.id);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async handleTyping(
        req: RequestWithParamsAndBodyAndUser<IdParam, { isTyping: boolean }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { id, nickname } = req.user;

            await chatService.handleTyping(
                req.params.id,
                { id, nickname },
                req.body.isTyping
            );

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async getMessagesByChatId(
        req: RequestWithParamsAndQueryAndUser<IdParam, PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const data = await chatService.getMessagesByChatId(
                req.params.id,
                req.user.id,
                req.query.limit,
                req.query.offset
            );

            res.json(data);
        } catch (error) {
            next(error);
        }
    }
}

export default new ChatController();
