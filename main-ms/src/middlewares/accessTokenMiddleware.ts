import { Response, NextFunction } from 'express';

import { RequestWithUser } from 'types/request';
import { ApiError } from '../ApiError';
import tokenService from '../services/tokenService';
import userService from '../services/userService';

export const accessTokenMiddleware =
    (checkBlocked: boolean = true) =>
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const { authorization } = req.headers;

            if (!authorization || !authorization.startsWith('Bearer')) {
                return next(ApiError.unauthorizedError());
            }

            const accessToken = authorization.split(' ')[1];

            if (!accessToken) {
                return next(ApiError.unauthorizedError());
            }

            const userData = tokenService.validateToken(accessToken);

            if (!userData) {
                return next(ApiError.unauthorizedError());
            }

            req.user = userData;

            if (checkBlocked) {
                const isBlocked = await userService.getUserBlockStatusById(
                    req.user.id
                );

                if (isBlocked) {
                    return next(ApiError.blocked());
                }
            }

            next();
        } catch (error) {
            return next(ApiError.unauthorizedError());
        }
    };
