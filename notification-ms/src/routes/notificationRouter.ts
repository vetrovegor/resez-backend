import Router from 'koa-router';
import { prisma } from '../prisma';

export const notificationRouter = new Router({ prefix: '/notification' });

notificationRouter.get('/', async ctx => {
    const norifications = await prisma.notification.findMany();
    ctx.status = 200;
    ctx.body = { norifications };
});
