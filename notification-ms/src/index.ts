import cron from 'node-cron';

import { app } from './app';
import config from './config';
import { verifyDatabaseConnection } from './prisma';
import { connectRabbitMQ, sendDelayedNotifications } from './services';

(async () => {
    await verifyDatabaseConnection();
    
    await connectRabbitMQ();

    cron.schedule('* * * * *', sendDelayedNotifications);

    app.listen(config.port).on('listening', () =>
        console.log(`Server started at port: ${config.port}`)
    );
})();
