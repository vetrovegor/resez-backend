import { Request, Response, NextFunction } from 'express';

import { ApiError } from "../apiError.js";

export const errorMiddleWare = (err: TypeError, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        return res.status(err.status).json({ error: true, message: err.message, errors: err.errors });
    }

    console.log(err);

    return res.status(500).json({
        error: true,
        message: 'Непредвиденная ошибка'
    });
}