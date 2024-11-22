import { NestFactory } from '@nestjs/core';
import * as proxy from 'express-http-proxy';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.enableCors({
        credentials: true,
        origin: configService.get('ALLOWED_ORIGINS').split(',')
    });

    app.use('/api/memory-ms', proxy(configService.get('MEMORY_MS_URL')));

    app.use('/api/education-ms', proxy(configService.get('EDUCATION_MS_URL')));

    app.use(
        '/api/education-oge-ms',
        proxy(configService.get('EDUCATION_OGE_MS_URL'))
    );

    app.use(
        '/api/education-ent-ms',
        proxy(configService.get('EDUCATION_ENT_MS_URL'))
    );

    app.use('/api/battle-ms', proxy(configService.get('BATTLE_MS_URL')));

    app.use((req, res, next) => {
        proxy(configService.get('MAIN_MS_URL'))(req, res, next);
    });

    await app.listen(configService.get('PORT'));
}
bootstrap();
