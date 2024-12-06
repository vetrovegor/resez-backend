import { Context, Next } from 'koa';
import { HttpError } from '../HttpError';

export const errorMiddleware = async (ctx: Context, next: Next) => {
    try {
        await next();
    } catch (err) {
        const { status, message, errors } = err as HttpError;
        
        ctx.body = {
            status: status || 500,
            message,
            errors
        };
    }
};