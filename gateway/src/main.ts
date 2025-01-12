import { NestFactory } from '@nestjs/core';
import * as proxy from 'express-http-proxy';
import { ConfigService } from '@nestjs/config';
// import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.enableCors({
        credentials: true,
        origin: configService.get('ALLOWED_ORIGINS').split(',')
    });

    // app.use(json({ limit: '10mb' }));
    // app.use(urlencoded({ extended: true, limit: '10mb' }));

    const routes = [
        { path: '/api/memory-ms', urlKey: 'MEMORY_MS_URL' },
        { path: '/api/education-ms', urlKey: 'EDUCATION_MS_URL' },
        { path: '/api/education-oge-ms', urlKey: 'EDUCATION_OGE_MS_URL' },
        { path: '/api/education-ent-ms', urlKey: 'EDUCATION_ENT_MS_URL' },
        { path: '/api/battle-ms', urlKey: 'BATTLE_MS_URL' },
        { path: '/api/notification-ms', urlKey: 'NOTIFICATION_MS_URL' }
    ];

    for (const route of routes) {
        app.use(route.path, proxy(configService.get(route.urlKey)));
    }

    app.use((req, res, next) => {
        proxy(configService.get('MAIN_MS_URL'))(req, res, next);
    });

    await app.listen(configService.get('PORT'));
}
bootstrap();
