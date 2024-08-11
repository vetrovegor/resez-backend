import { Response, NextFunction } from 'express';
import {
    IdParam,
    PaginationQuery,
    RequestWithBodyAndUser,
    RequestWithParams,
    RequestWithQuery
} from 'types/request';

import feedbackService from '../services/feedbackService';

class FeedbackController {
    async createFeedback(
        req: RequestWithBodyAndUser<{ text: string }>,
        res: Response,
        next: NextFunction
    ) {
        await feedbackService.createFeedback(req.user.id, req.body.text);
        res.sendStatus(200);
    }

    async getFeedback(
        req: RequestWithQuery<PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        const data = await feedbackService.getFeedback(
            req.query.limit,
            req.query.offset
        );

        res.json(data);
    }

    async readFeedback(
        req: RequestWithParams<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        const feedback = await feedbackService.readFeedback(req.params.id);
        res.json({ feedback });
    }
}

export default new FeedbackController();
