import Router from 'koa-router';

import { notificationBodyMiddleware, validateBody } from '../middlewares';
import { createNotification } from '../services';
import { NotificationBody } from '../types/notification';
import { notificationSchema } from '../validators';

export const adminNotificationRouter = new Router({
    prefix: '/admin/notification'
});

adminNotificationRouter.post(
    '/',
    validateBody(notificationSchema),
    notificationBodyMiddleware,
    async ctx => {
        await createNotification(
            <NotificationBody>ctx.request.body,
            ctx.state.user.id
        );

        ctx.status = 200;
    }
);
