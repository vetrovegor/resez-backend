import { Context, Next } from 'koa';

import { NotificationBody } from '../types/notification';
import { HttpError } from '../HttpError';

export const notificationBodyMiddleware = async (ctx: Context, next: Next) => {
    const body = <NotificationBody>ctx.request.body;
    let { userIds, sendAt } = body;

    const currentDate = new Date();

    if (sendAt) {
        if (new Date(sendAt) < currentDate) {
            throw new HttpError(400, 'Некорректная дата');
        }
    } else {
        sendAt = currentDate.toISOString();
    }

    const isDelayed = Number(new Date(sendAt)) - Number(currentDate) > 0;

    // запросить все id пользователей если userIds пустой

    ctx.request.body = { ...body, date: sendAt, isDelayed, userIds: new Set(userIds) };

    await next();
};
