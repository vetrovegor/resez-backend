import { Response, NextFunction } from 'express';
import {
    IdParam,
    PaginationQuery,
    RequestWithBodyAndUser,
    RequestWithParams,
    RequestWithQuery
} from 'src/types/request';

import feedbackService from '@services/feedbackService';

class FeedbackController {
    async createFeedback(
        req: RequestWithBodyAndUser<{ text: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            await feedbackService.createFeedback(req.ip, req.user.id, req.body.text);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async getFeedback(
        req: RequestWithQuery<PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const data = await feedbackService.getFeedback(
                req.query.limit,
                req.query.offset
            );
    
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async readFeedback(
        req: RequestWithParams<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const feedback = await feedbackService.readFeedback(req.params.id);
            res.json({ feedback });
        } catch (error) {
            next(error);
        }
    }
}

export default new FeedbackController();
