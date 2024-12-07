import { Next, ParameterizedContext } from 'koa';
import Joi from 'joi';
import { HttpError } from '../HttpError';
import Router from 'koa-router';

export const validateParams = (schema: Joi.ObjectSchema) => {
    // TODO: как-то более лаконично типизировать ctx
    return async (ctx: ParameterizedContext<any, Router.IRouterParamContext<any, {}>, any>, next: Next) => {
        const { error } = schema.validate(ctx.params, {
            abortEarly: false
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