import { Request, Response, NextFunction } from 'express';

import { ApiError } from "../ApiError";

export const errorMiddleWare = (err: TypeError, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        return res.status(err.status).json({
            statusCode: err.status,
            message: err.message,
            errors: err.errors
        });
    }

    console.log(err);

    return res.status(500).json({
        error: true,
        message: 'Непредвиденная ошибка'
    });
}