import path from 'path';
import Router from 'koa-router';
import yamljs from 'yamljs';
import { koaSwagger } from 'koa2-swagger-ui';

import { notificationRouter } from './notificationRouter';
import { adminNotificationRouter } from './adminRouter';

export const router = new Router();

const spec = yamljs.load(path.join(__dirname, '..', '..', 'api.yml'));

router.get('/api-docs', koaSwagger({ routePrefix: false, swaggerOptions: { spec } }));

router.get('/ping', ctx => {
    ctx.body = { msg: 'pong' };
});

router
    .use(notificationRouter.routes())
    .use(notificationRouter.allowedMethods())
    .use(adminNotificationRouter.routes())
    .use(adminNotificationRouter.allowedMethods());
