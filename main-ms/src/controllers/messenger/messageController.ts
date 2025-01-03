import { Response, NextFunction } from 'express';
import { UploadedFile } from 'express-fileupload';

import {
    RequestWithParamsAndBodyAndUser,
    IdParam,
    RequestWithParamsAndUser,
    RequestWithParamsAndQueryAndUser,
    RequestWithParams,
    RequestWithQueryAndUser,
    IDsQuery
} from 'types/request';
import messageService from '../../services/messenger/messageService';
import { MessageRequestBodyDTO } from 'types/messenger';

class MessageController {
    async sendMessageToUser(
        req: RequestWithParamsAndBodyAndUser<IdParam, MessageRequestBodyDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const message = await messageService.sendMessageToUser(
                req.user.id,
                req.params.id,
                req.body.message,
                req.body.files
            );

            res.json({ message });
        } catch (error) {
            next(error);
        }
    }

    async sendMessageToChat(
        req: RequestWithParamsAndBodyAndUser<IdParam, MessageRequestBodyDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const message = await messageService.sendMessageToChat(
                req.user.id,
                req.params.id,
                req.body.message,
                req.body.files
            );

            res.json({ message });
        } catch (error) {
            next(error);
        }
    }

    async editMessage(
        req: RequestWithParamsAndBodyAndUser<IdParam, MessageRequestBodyDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const message = await messageService.editMessage(
                req.params.id,
                req.user.id,
                req.body.message
            );

            res.json({ message });
        } catch (error) {
            next(error);
        }
    }

    async deleteMessage(
        req: RequestWithQueryAndUser<IDsQuery & { for_all: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const message = await messageService.deleteMessage(
                req.user.id,
                req.query.ids,
                req.query.for_all
            );

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async readMessage(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            await messageService.readMessage(req.params.id, req.user.id);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async getMessageReaders(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const readers = await messageService.getMessageReaders(
                req.params.id,
                req.user.id
            );

            res.json({ readers });
        } catch (error) {
            next(error);
        }
    }
}

export default new MessageController();
