import { Context, Next } from 'koa';
import { HttpError } from '../HttpError';
import logger from '../logger';

export const errorMiddleware = async (ctx: Context, next: Next) => {
    try {
        await next();
    } catch (err) {
        const { status, message, errors } = err as HttpError;

        if (!status) {
            logger.error(`Error occurred: ${message}`, { errors });
        }

        ctx.status = status || 500;

        ctx.body = {
            status: status || 500,
            message,
            errors
        };
    }
};
