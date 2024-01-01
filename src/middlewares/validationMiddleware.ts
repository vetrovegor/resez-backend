import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import { ApiError } from "../apiError.js";

export const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(ApiError.validationError(errors.array()));
    }

    return next();
}