import { Response, NextFunction } from 'express';

import { ApiError } from '../apiError';
import tokenService from '../services/tokenService';
import { RequestWithUserTokenInfo } from 'types/request';

export const refreshTokenMiddleware = async (req: RequestWithUserTokenInfo, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.cookies;
        

        if (!refreshToken) {
            return next(ApiError.unauthorizedError());
        }

        const userData = tokenService.validateRefreshToken(refreshToken);
        const foundToken = await tokenService.findTokenByToken(refreshToken);

        if (!userData || !foundToken) {
            return next(ApiError.unauthorizedError());
        }

        req.user = userData;

        next();
    } catch (e) {
        return next(ApiError.unauthorizedError());
    }
}