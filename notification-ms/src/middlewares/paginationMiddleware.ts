import { Context, Next } from 'koa';

import { HttpError } from '../HttpError';

export const paginationMiddleware = async (ctx: Context, next: Next) => {
    const { query } = ctx;
    let { limit = 5, offset = 0 } = query;

    limit = Number(limit);
    offset = Number(offset);

    if (isNaN(limit) || limit < 0) {
        throw new HttpError(400, 'Некорректное значение limit');
    }

    if (isNaN(offset) || offset < 0) {
        throw new HttpError(400, 'Некорректное значение offset');
    }

    limit = limit > 100 ? 100 : limit;

    // TODO
    ctx.query = {
        ...query,
        limit: limit.toString(),
        offset: offset.toString()
    };

    await next();
};
