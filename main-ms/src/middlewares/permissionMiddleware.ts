import { Response, NextFunction } from 'express';

import { RequestWithUser } from 'src/types/request';
import { ApiError } from '@ApiError';

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
            next(ApiError.forbidden());
        }
    };
};
