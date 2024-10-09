import express from 'express';
import cookieParser from 'cookie-parser';
import useragent from 'express-useragent';
import fileUpload from 'express-fileupload';
import swaggerUi from 'swagger-ui-express';
import cron from 'node-cron';
import { collectDefaultMetrics, register } from 'prom-client';
import 'dotenv/config';

import { router } from './routes/router';
import { errorMiddleWare } from './middlewares/errorMiddleware';
import { sequelize } from './db/connection';
import { STATIC_PATH } from './consts/STATIC_PATH';
import permissionService from './services/roles/permissionService';
import swaggerDocument from './swagger.json';
import messageTypeService from './services/messenger/messageTypeService';
import notifyTypeService from './services/notifies/notifyTypeService';
import notifyService from './services/notifies/notifyService';
import rmqService from './services/rmqService';
import { redisClient } from './redisClient';
import subscribeService from './services/subscribeService';
import achievementService from './services/achievementService';

collectDefaultMetrics();

export const app = express();

app.get('/metrics', async (_req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});

app.use(express.json());
app.use(cookieParser());
app.use(useragent.express());
app.set('trust proxy', true);
app.use(fileUpload());
app.use('/api', router);
app.use('/api/static', express.static(STATIC_PATH));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(errorMiddleWare);

const PORT = process.env.PORT || 8080;

const start = async () => {
    await sequelize.authenticate();

    if (process.env.NODE_ENV == 'development') {
        await sequelize.sync({ alter: true });

        await permissionService.initPermissions();

        await messageTypeService.initMessageTypes();

        await notifyTypeService.initNotifyTypes();

        await subscribeService.initSubscriptions();

        await achievementService.initAchievements();
    } else {
        await sequelize.sync();
    }

    await rmqService.init();
    await redisClient.connect();

    // сделать очистку просроченных кодов кодов
    // завершение сессий

    // отправка отложенных уведомлений
    cron.schedule('* * * * *', notifyService.sendDelayedNotifies);

    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
};

start();
