import { Context, Next } from 'koa';

import { NotificationBody } from '../types/notification';
import { HttpError } from '../HttpError';

export const notificationBodyMiddleware = async (ctx: Context, next: Next) => {
    const body = <NotificationBody>ctx.request.body;
    let { date } = body;

    const currentDate = new Date();

    if (date) {
        if (new Date(date) < currentDate) {
            throw new HttpError(400, 'Некорректная дата');
        }
    } else {
        date = currentDate.toISOString();
    }

    const isdDelayed = Number(new Date(date)) - Number(currentDate) > 0;

    // запросить все id пользователей если userIds пустой

    ctx.request.body = { ...body, date, isdDelayed };

    await next();
};
