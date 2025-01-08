import { Request, Response, NextFunction } from 'express';

import { ApiError } from '../ApiError';
import logger from '../logger';

export const errorMiddleWare = (
    err: TypeError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof ApiError) {
        return res.status(err.status).json({
            statusCode: err.status,
            message: err.message,
            errors: err.errors
        });
    }

    logger.error(`Error occurred: ${err.message}`, { stack: err.stack });

    console.log(err.message, err.stack);

    return res.status(500).json({
        error: true,
        message: 'Непредвиденная ошибка'
    });
};
