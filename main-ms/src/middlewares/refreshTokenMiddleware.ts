import { Response, NextFunction } from 'express';

import { ApiError } from '../ApiError';
import tokenService from '../services/tokenService';
import { RequestWithUser } from 'types/request';

export const refreshTokenMiddleware = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return next(ApiError.unauthorizedError());
        }

        const userData = await tokenService.validateRefreshToken(refreshToken);

        if (!userData) {
            return next(ApiError.unauthorizedError());
        }

        req.user = userData;

        next();
    } catch (error) {
        return next(ApiError.unauthorizedError());
    }
};
