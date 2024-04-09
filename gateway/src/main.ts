import { NestFactory } from '@nestjs/core';
import * as proxy from 'express-http-proxy';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        credentials: true,
        origin: ['http://localhost:3000']
    });

    const configService = app.get(ConfigService);

    app.use('/api/user-ms', proxy(configService.get('USER_MS_URL')));
    app.use('/api/messenger-ms', proxy(configService.get('MESSENGER_MS_URL')));

    app.use((req, res, next) => {
        proxy(configService.get('MAIN_MS_URL'))(req, res, next);
    });

    await app.listen(configService.get('PORT'));
}
bootstrap();
