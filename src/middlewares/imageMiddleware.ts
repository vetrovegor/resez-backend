import { Request, Response, NextFunction } from 'express';
import mimeTypes from 'mime-types';

import { ApiError } from '../apiError';

export const imageMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // тиипизровать
    const files = req.files;

    for (let fileKey in files) {
        const file = files[fileKey];
        const fileName = file.name;
        const mimeType = mimeTypes.lookup(fileName);

        if (!mimeType || !mimeType.startsWith('image/')) {
            throw ApiError.badRequest(`Файл ${fileName} не является изображением`);
        }
    }

    next();
}