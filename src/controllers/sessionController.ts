import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import { PaginationParams, RequestWithParams, RequestWithParamsAndUser, RequestWithQueryAndUser, WithId } from 'types/request';
import sessionService from '../services/sessionService';
import { ApiError } from '../apiError';

class SessionController {
    async getUserSessions(req: RequestWithQueryAndUser<PaginationParams>, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;
            const { limit, offset } = req.query;

            const data = await sessionService.getUserSessions(req, id, limit, offset);

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async endSessionById(req: RequestWithParamsAndUser<WithId>, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.validationError(errors.array()));
            }

            const { id: sessionId } = req.params;
            const { id: userId } = req.user;

            await sessionService.endSessionById(sessionId, userId);

            res.send(200);
        } catch (error) {
            next(error);
        }
    }

    async endAllSessions(req: RequestWithQueryAndUser<PaginationParams>, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;
            const { limit, offset } = req.query;

            const data = await sessionService.endAllSessions(req, id, limit, offset);

            res.json(data);
        } catch (error) {
            next(error);
        }
    }
}

export default new SessionController();