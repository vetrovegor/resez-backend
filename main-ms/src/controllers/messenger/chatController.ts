import { Response, NextFunction, Request } from 'express';
import { UploadedFile } from 'express-fileupload';

import {
    IdParam,
    PaginationQuery,
    RequestWithBodyAndUser,
    RequestWithParams,
    RequestWithParamsAndQuery,
    RequestWithParamsAndUser,
    RequestWithQueryAndUser
} from 'types/request';
import { GroupCreateRequestDTO, UserChatParams } from 'types/messenger';
import chatService from '../../services/messenger/chatService';

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
        req: RequestWithParamsAndUser<UserChatParams>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { chatId, userId } = req.params;

            await chatService.addUserToChat(chatId, userId, req.user.id);

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

    async getChatInfo(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const response = await chatService.getChatInfo(
                req.params.id,
                req.user.id
            );

            res.json(response);
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

    async joinChatViaLink(
        req: RequestWithParamsAndUser<{ inviteLink: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const response = await chatService.joinChatViaLink(
                req.user.id,
                req.params.inviteLink
            );

            res.json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default new ChatController();
