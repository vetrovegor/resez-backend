import { Response, NextFunction } from 'express';

import {
    RequestWithParamsAndBodyAndUser,
    IdParam,
    RequestWithParamsAndUser,
    RequestWithParamsAndQueryAndUser
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
                req.body.message
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
                req.body.message
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
        req: RequestWithParamsAndQueryAndUser<IdParam, { for_all: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const message = await messageService.deleteMessage(
                req.params.id,
                req.user.id,
                req.query.for_all
            );

            res.json({ message });
        } catch (error) {
            next(error);
        }
    }
}

export default new MessageController();
