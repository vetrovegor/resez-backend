import { Response, NextFunction } from 'express';

import { RequestWithUser } from 'types/request';
import { ApiError } from '../apiError';
import tokenService from '../services/tokenService';

export const accessTokenMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return next(ApiError.unauthorizedError());
        }

        const bearer = authorizationHeader.split(' ')[0];
        const accessToken = authorizationHeader.split(' ')[1];

        if (bearer != 'Bearer' || !accessToken) {
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