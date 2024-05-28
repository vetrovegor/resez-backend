import { Response, NextFunction } from 'express';

import subscribeService from '../services/subscribeService';
import { RequestWithBody } from 'types/request';

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
            const { subscription, nickname, expiredDate, isPermanent } = req.body;
    
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
}

export default new SubscriptionController();
