import { Response, NextFunction } from 'express';

import { PaginationQuery, RequestWithParamsAndUser, RequestWithQueryAndUser, WithId } from 'types/request';
import sessionService from '../services/sessionService';

class SessionController {
    async getUserSessions(req: RequestWithQueryAndUser<PaginationQuery>, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;
            const { limit, offset } = req.query;

            // типизировать
            const data = await sessionService.getUserSessions(req, id, limit, offset);

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async endSessionById(req: RequestWithParamsAndUser<WithId>, res: Response, next: NextFunction) {
        try {
            const { id: sessionId } = req.params;
            const { id: userId } = req.user;

            await sessionService.endSessionById(sessionId, userId);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async endAllSessions(req: RequestWithQueryAndUser<PaginationQuery>, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;
            const { limit, offset } = req.query;

            // типизировать
            const data = await sessionService.endAllSessions(req, id, limit, offset);

            res.json(data);
        } catch (error) {
            next(error);
        }
    }
}

export default new SessionController();