import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import config from '../config';
import { HttpError } from '../HttpError';

export const authMiddleware = async (ctx: Context, next: Next) => {
    const token = ctx.headers.authorization?.split(' ')[1];

    if (!token) {
        throw new HttpError(401, 'Пользователь не авторизован');
    }

    try {
        const payload = jwt.verify(token, config.jwtAccessSecret);
        ctx.state.user = payload;
    } catch {
        throw new HttpError(401, 'Пользователь не авторизован');
    }
    
    await next();
};
