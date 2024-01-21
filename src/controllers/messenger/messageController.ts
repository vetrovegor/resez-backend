import { Response, NextFunction } from 'express';

import { RequestWithParamsAndBodyAndUser, IdParam } from 'types/request';
import messageService from '../../services/messenger/messageService';
import { MessageRequestBodyDTO } from 'types/messenger';

class MessageController {
    async sendMessageToUser(req: RequestWithParamsAndBodyAndUser<IdParam, MessageRequestBodyDTO>, res: Response, next: NextFunction) {
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

    async sendMessageToChat(req: RequestWithParamsAndBodyAndUser<IdParam, MessageRequestBodyDTO>, res: Response, next: NextFunction) {
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
}

export default new MessageController();