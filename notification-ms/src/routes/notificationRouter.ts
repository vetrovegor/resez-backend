import Router from 'koa-router';

import {
    getUnreadNotificationsCount,
    getUserNotifications,
    readAllNotifications,
    readNotification
} from '../services';
import {
    authMiddleware,
    paginationMiddleware,
    validateParams,
    validateQuery
} from '../middlewares';
import { idSchema, unreadSchema } from '../validators';

export const notificationRouter = new Router({ prefix: '/notification' });

notificationRouter.use(authMiddleware);

notificationRouter.get(
    '/',
    validateQuery(unreadSchema),
    paginationMiddleware,
    async ctx => {
        const data = await getUserNotifications(
            ctx.state.user.id,
            Number(ctx.query.limit),
            Number(ctx.query.offset),
            ctx.query.unread?.toString()
        );

        ctx.body = data;
    }
);

notificationRouter.get('/unread-count', async ctx => {
    const count = await getUnreadNotificationsCount(ctx.state.user.id);

    ctx.body = { count };
});

notificationRouter.patch('/read/:id', validateParams(idSchema), async ctx => {
    await readNotification(Number(ctx.params.id), ctx.state.user.id);

    ctx.status = 200;
});

notificationRouter.patch('/read-all', async ctx => {
    await readAllNotifications(ctx.state.user.id);

    ctx.status = 200;
});
