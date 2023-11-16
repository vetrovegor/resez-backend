import { Response, NextFunction } from 'express';

import { RequestWithUserTokenInfo } from 'types/request';
import { ApiError } from '../apiError';
import tokenService from '../services/tokenService';

export const accessTokenMiddleware = async (req: RequestWithUserTokenInfo, res: Response, next: NextFunction) => {
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
    } catch (e) {
        return next(ApiError.unauthorizedError());
    }
}