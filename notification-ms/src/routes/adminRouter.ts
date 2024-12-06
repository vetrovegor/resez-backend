import Router from 'koa-router';

import { notificationBodyMiddleware, validateBody } from '../middlewares';
import { notificationSchema } from '../validators/notificationSchema';
import { createNotification } from '../services';
import { NotificationBody } from '../types/notification';

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
