import { NextFunction } from 'express';

import { RequestWithBody } from 'types/request';
import { AvatarDecorationDTO } from 'types/store';
import { StoreContentType } from '../../enums/store';
import { ApiError } from '../../ApiError';
import { UploadedFile } from 'express-fileupload';

export const avatarDecorationMiddleware = async (
    req: RequestWithBody<AvatarDecorationDTO>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { contentType } = req.body;
        const { mimetype } = req.files.content as UploadedFile;

        if (!Object.values(StoreContentType).includes(contentType)) {
            throw ApiError.badRequest('Некорректное значение contentType');
        }

        if (
            contentType == StoreContentType.STATIC &&
            !mimetype.startsWith('image/')
        ) {
            throw ApiError.badRequest('Файл должен быть картинкой');
        }

        if (
            contentType == StoreContentType.ANIMATION &&
            mimetype != 'application/json'
        ) {
            throw ApiError.badRequest('Файл должен быть в формате JSON');
        }

        next();
    } catch (error) {
        next(error);
    }
};
