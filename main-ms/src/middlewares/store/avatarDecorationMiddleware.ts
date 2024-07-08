import { NextFunction } from 'express';

import { RequestWithBody } from 'types/request';
import { AvatarDecorationDTO } from 'types/store';
import { StoreContentType } from '../../enums/store';
import { ApiError } from '../../ApiError';

export const avatarDecorationMiddleware = async (
    req: RequestWithBody<AvatarDecorationDTO>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { contentType, options } = req.body;

        if (!Object.values(StoreContentType).includes(contentType)) {
            return next(
                ApiError.badRequest('Некорректное значение contentType')
            );
        }

        next();
    } catch (error) {
        next(error);
    }
};
