import { Context, Next } from 'koa';

export const requestTimingLogger = async (ctx: Context, next: Next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    // const body = <RequestBody>ctx.request.body;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
};
