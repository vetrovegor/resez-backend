import { Request, Response, NextFunction } from 'express';
import mimeTypes from 'mime-types';
import { UploadedFile } from 'express-fileupload';

import { ApiError } from '@ApiError';

export const imageMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const files = req.files;

    for (let fileKey in files) {
        const file = files[fileKey] as UploadedFile;
        const fileName = file.name;
        const mimeType = mimeTypes.lookup(fileName);

        if (!mimeType || !mimeType.startsWith('image/')) {
            throw ApiError.badRequest(`Файл ${fileName} не является изображением`);
        }
    }

    next();
}