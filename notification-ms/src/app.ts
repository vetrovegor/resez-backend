import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';

import { router } from './routes';
import config from './config';
import {
    authMiddleware,
    errorMiddleware,
    requestTimingLogger
} from './middlewares';

export const app = new Koa();

app.use(cors({ origin: config.allowedOrigins, credentials: true }))
    .use(bodyParser())
    .use(errorMiddleware)
    .use(authMiddleware)
    .use(requestTimingLogger)
    .use(router.routes())
    .use(router.allowedMethods());
