import { Response, NextFunction, Request } from 'express';

import subscribeService from '../services/subscribeService';
import {
    IdParam,
    RequestWithBody,
    RequestWithParamsAndUser
} from 'types/request';

class SubscriptionController {
    async assignSubscription(
        req: RequestWithBody<{
            subscription: string;
            nickname: string;
            expiredDate: Date;
            isPermanent: boolean;
        }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { subscription, nickname, expiredDate, isPermanent } =
                req.body;

            await subscribeService.assignSubscription(
                subscription,
                nickname,
                expiredDate,
                isPermanent
            );

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async getSubscriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const subscriptions = await subscribeService.getSubscriptions();
            res.json({ subscriptions });
        } catch (error) {
            next(error);
        }
    }

    async buySubscription(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            await subscribeService.buySubscription(req.params.id, req.user.id);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }
}

export default new SubscriptionController();
