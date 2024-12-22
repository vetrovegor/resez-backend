import Router from 'koa-router';

import {
    authMiddleware,
    notificationBodyMiddleware,
    paginationMiddleware,
    permissionMiddleware,
    validateBody,
    validateParams,
    validateQuery
} from '../middlewares';
import {
    createNotification,
    deleteNotificationById,
    getNotificationById,
    getNotifications,
    getUserNotificationsForAdmin,
    updateNotificationById
} from '../services';
import { NotificationBody } from '../types/notification';
import {
    idSchema,
    notificationFilterSchema,
    notificationSchema,
    unreadSchema
} from '../validators';

export const adminNotificationRouter = new Router({
    prefix: '/admin/notification'
});

adminNotificationRouter.use(authMiddleware);
adminNotificationRouter.use(permissionMiddleware('Отправка уведомлений'));

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

adminNotificationRouter.get(
    '/',
    validateQuery(notificationFilterSchema),
    paginationMiddleware,
    async ctx => {
        const data = await getNotifications(
            Number(ctx.query.limit),
            Number(ctx.query.offset),
            ctx.query.delayed?.toString(),
            Number(ctx.query.sender_id)
        );

        ctx.body = data;
    }
);

adminNotificationRouter.get('/:id', validateParams(idSchema), async ctx => {
    const notification = await getNotificationById(Number(ctx.params.id));

    ctx.body = { notification };
});

adminNotificationRouter.delete('/:id', validateParams(idSchema), async ctx => {
    await deleteNotificationById(Number(ctx.params.id));

    ctx.status = 200;
});

adminNotificationRouter.patch(
    '/:id',
    validateParams(idSchema),
    validateBody(notificationSchema),
    notificationBodyMiddleware,
    async ctx => {
        await updateNotificationById(Number(ctx.params.id), <NotificationBody>ctx.request.body);

        ctx.status = 200;
    }
);

adminNotificationRouter.get(
    '/:id/user',
    validateParams(idSchema),
    validateQuery(unreadSchema),
    paginationMiddleware,
    async ctx => {
        const data = await getUserNotificationsForAdmin(
            Number(ctx.params.id),
            Number(ctx.query.limit),
            Number(ctx.query.offset),
            ctx.query.unread?.toString()
        );

        ctx.body = data;
    }
);

// TODO: запрос редактирования
