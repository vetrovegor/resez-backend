import { Response, NextFunction } from 'express';

import { RequestWithUser } from 'types/request';
import tokenService from '../services/tokenService';

export const optionalAuthMiddleware = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    try {
        const accessToken = req.headers.authorization.split(' ')[1];
        const userData = tokenService.validateToken(accessToken);

        req.user = userData;

        next();
    } catch (error) {
        req.user = {
            id: -1,
            nickname: null,
            telegramChatId: null,
            subscription: null,
            permissions: []
        };

        return next();
    }
};
