import { Response, NextFunction, Request } from 'express';

import subscriptionService from '../services/subscribtionService';
import {
    IdParam,
    RequestWithBody,
    RequestWithParamsAndUser
} from 'types/request';
import { AssignsubscriptionDTO } from 'types/subscription';

class SubscriptionController {
    async assignSubscription(
        req: RequestWithBody<AssignsubscriptionDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const {subscriptionId, userId, expiredDate, isPermanent } =
                req.body;

            await subscriptionService.assignSubscription(
                subscriptionId,
                userId,
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
            const subscriptions = await subscriptionService.getSubscriptions();
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
            await subscriptionService.buySubscription(req.params.id, req.user.id);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }
}

export default new SubscriptionController();
