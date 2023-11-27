import { Response, NextFunction } from 'express';

import { RequestWithUser } from 'types/request';
import { ApiError } from '../apiError';
import userService from '../services/userService';

export const blockedMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const isBlocked = await userService.getUserBlockStatusById(req.user.id);

        if (isBlocked) {
            return next(ApiError.blocked());
        }

        next();
    } catch (error) {
        next(error);
    }
}