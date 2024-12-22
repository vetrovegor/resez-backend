import { Context, Next } from 'koa';

import { NotificationBody } from '../types/notification';
import { HttpError } from '../HttpError';
import { getAllUserIDs, validateUserIds } from '../services';

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

    const userIdsValid = await validateUserIds(userIds);

    if (!userIdsValid) {
        throw new HttpError(404, 'Пользователь не найден');
    }

    if (userIds.length == 0) {
        userIds = await getAllUserIDs();
    }

    ctx.request.body = {
        ...body,
        date: sendAt,
        isDelayed,
        userIds: [...new Set(userIds)]
    };

    await next();
};
