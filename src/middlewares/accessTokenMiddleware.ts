import { Response, NextFunction } from 'express';

import { RequestWithUser } from 'types/request';
import { ApiError } from '../apiError';
import tokenService from '../services/tokenService';

export const accessTokenMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const { authorization } = req.headers;

        if (!authorization || !authorization.startsWith('Bearer')) {
            return next(ApiError.unauthorizedError());
        }

        const accessToken = authorization.split(' ')[1];

        if (!accessToken) {
            return next(ApiError.unauthorizedError());
        }

        const userData = tokenService.validateAccessToken(accessToken);

        if (!userData) {
            return next(ApiError.unauthorizedError());
        }

        req.user = userData;

        next();
    } catch (error) {
        return next(ApiError.unauthorizedError());
    }
}