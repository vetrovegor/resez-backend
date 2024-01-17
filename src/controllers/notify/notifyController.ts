import { Response, NextFunction } from 'express';

import notifyService from '../../services/notifies/notifyService';
import { SendNotifiesDTO, UserNotifyQuery } from 'types/notify';
import { PaginationQuery, RequestWithBodyAndUser, RequestWithParamsAndUser, RequestWithQueryAndUser, WithId } from 'types/request';

class NotifyController {
    async sendNotifies(req: RequestWithBodyAndUser<SendNotifiesDTO>, res: Response, next: NextFunction) {
        try {
            const { notifyTypeId, title, content, author, users, date, isdDelayed } = req.body;

            await notifyService.sendNotifies(
                notifyTypeId,
                title,
                content,
                author,
                users,
                date,
                isdDelayed,
                req.user.id
            );

            // логирование

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async getUserNotifies(req: RequestWithQueryAndUser<PaginationQuery & UserNotifyQuery>, res: Response, next: NextFunction) {
        try {
            const { limit, offset, unread } = req.query;

            const data = await notifyService.getUserNotifies(req.user.id, limit, offset, unread);

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async readNotify(req: RequestWithParamsAndUser<WithId>, res: Response, next: NextFunction) {
        try {
            const notify = await notifyService.readNotify(req.user.id, req.params.id);

            res.json({ notify });
        } catch (error) {
            next(error);
        }
    }

    async readAllNotifies(req: RequestWithQueryAndUser<PaginationQuery>, res: Response, next: NextFunction) {
        try {
            const { limit, offset } = req.query;

            const data = await notifyService.readAllNotifies(req.user.id, limit, offset);

            res.json(data);
        } catch (error) {
            next(error);
        }
    }
}

export default new NotifyController();