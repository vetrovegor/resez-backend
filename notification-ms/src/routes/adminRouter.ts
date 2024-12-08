import Router from 'koa-router';

import {
    notificationBodyMiddleware,
    paginationMiddleware,
    permissionMiddleware,
    validateBody,
    validateParams,
    validateQuery
} from '../middlewares';
import {
    createNotification,
    getNotificationById,
    getNotifications
} from '../services';
import { NotificationBody } from '../types/notification';
import {
    idSchema,
    notificationFilterSchema,
    notificationSchema
} from '../validators';

export const adminNotificationRouter = new Router({
    prefix: '/admin/notification'
});

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

adminNotificationRouter.get(
    '/:id',
    validateParams(idSchema),
    async ctx => {
        const notification = await getNotificationById(Number(ctx.params.id));

        ctx.body = { notification };
    }
);

// TODO: запрос редактирования

// TODO: запрос удаления

// TODO: запрос пользователей, которым отправлено уведомление, а также показывать, кто прочитал
