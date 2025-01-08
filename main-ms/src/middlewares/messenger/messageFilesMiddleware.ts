import { Response, NextFunction } from 'express';

import { ApiError } from '../../ApiError';
import { RequestWithUser } from 'src/types/request';
import { Subscriptions } from '@enums/subscriptions';

export const messageFilesMiddleware = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    let files = req?.files?.files ? req.files.files : [];

    if (!Array.isArray(files)) {
        files = [files];
    }

    const { subscription } = req.user;

    if (!subscription && files.length > 0) {
        return next(
            ApiError.badRequest('Чтобы отправлять файлы нужно подписка')
        );
    }

    for (const { size, name } of files) {
        if (
            subscription.subscription != Subscriptions.PremiumPlus &&
            size > 1 * 1024 * 1024
        ) {
            return next(
                ApiError.badRequest(`Размер файла ${name} превышает ${1} МБ`)
            );
        } else if (size > 5 * 1024 * 1024) {
            return next(
                ApiError.badRequest(`Размер файла ${name} превышает ${5} МБ`)
            );
        }
    }

    req.files = { files };

    return next();
};
