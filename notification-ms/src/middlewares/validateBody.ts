import { Context, Next } from 'koa';
import Joi from 'joi';
import { HttpError } from '../HttpError';

export const validateBody = (schema: Joi.ObjectSchema) => {
    return async (ctx: Context, next: Next) => {
        const { error } = schema.validate(ctx.request.body, {
            abortEarly: false,
            allowUnknown: true
        });
        if (error) {
            throw new HttpError(
                400,
                'Validation error',
                error.details.map(err => err.message)
            );
        }
        await next();
    };
};