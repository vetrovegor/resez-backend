import { Response, NextFunction } from 'express';

import { RequestWithUser } from 'types/request';
import { ApiError } from '../ApiError';
import userService from '../services/userService';

export const permissionMiddleware = (requiredPermission: string) => {
    return async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            if (
                !req.user.permissions.some(
                    permission => permission.permission == requiredPermission
                )
            ) {
                throw ApiError.forbidden();
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
