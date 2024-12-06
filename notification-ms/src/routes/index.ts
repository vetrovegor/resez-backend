import Router from 'koa-router';
import { notificationRouter } from './notificationRouter';
import { adminNotificationRouter } from './adminRouter';

export const router = new Router();

router.get('/ping', ctx => {
    ctx.body = { msg: 'pong' };
});

router
    .use(notificationRouter.routes())
    .use(notificationRouter.allowedMethods())
    .use(adminNotificationRouter.routes())
    .use(adminNotificationRouter.allowedMethods());
