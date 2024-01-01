import { Response, NextFunction } from "express";

import { PaginationQuery, RequestWithQuery } from "types/request.js";
import { ApiError } from "../apiError";

export const paginationMiddleware = async (req: RequestWithQuery<PaginationQuery>, res: Response, next: NextFunction) => {
    try {
        let { limit = 5, offset = 0 } = req.query;

        limit = Number(limit);
        offset = Number(offset);

        if (isNaN(limit) || limit < 0) {
            return next(ApiError.badRequest('Некорректное значение limit'));
        }

        if (isNaN(offset) || offset < 0) {
            return next(ApiError.badRequest('Некорректное значение offset'));
        }

        if (limit > 100) {
            return next(ApiError.badRequest('limit должен быть не более 100'));
        }

        req.query.limit = limit;
        req.query.offset = offset;

        return next();
    } catch (error) {
        return next(error);
    }
}