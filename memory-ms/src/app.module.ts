import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@auth/auth.module';
import { CollectionModule } from './collection/collection.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { Module } from '@nestjs/common';
import { SettingsModule } from '@settings/settings.module';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { QaModule } from '@qa/qa.module';
import { RabbitMqModule } from '@rabbit-mq/rabbit-mq.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads')
        }),
        DatabaseModule,
        AuthModule,
        CollectionModule,
        QaModule,
        SettingsModule,
        UploadModule,
        RabbitMqModule
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        }
    ]
})
export class AppModule {}
