import { Request, Response, NextFunction } from "express";

import { ApiError } from "../apiError";

export const fileMiddleware = (maxMb: number, required: boolean = true) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const files = req.files;

            if (required && (!files || Object.keys(files).length === 0)) {
                throw ApiError.badRequest('Файлы не найдены');
            }

            for (let fileKey in files) {
                const file = files[fileKey];
                // типизировать
                const fileName = file.name;

                if (file.size > maxMb * 1024 * 1024) {
                    throw ApiError.badRequest(`Размер файла ${fileName} превышает ${maxMb} МБ`);
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    }
}