import { Context, Next } from 'koa';
import { HttpError } from '../HttpError';

export const permissionMiddleware = (requiredPermission: string) => {
    return async (ctx: Context, next: Next) => {
        const permissions = ctx.state.user.permissions as [
            { id: number; permission: string }
        ];

        if (
            !permissions.some(
                permission => permission.permission == requiredPermission
            )
        ) {
            throw new HttpError(403, 'Недостаточно прав');
        }

        await next();
    };
};
