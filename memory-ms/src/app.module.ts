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
import { LikeModule } from './like/like.module';
import { AdminModule } from './admin/admin.module';
import { MatchScoreModule } from '@match-score/match-score.module';
import { UserModule } from '@user/user.module';

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
        RabbitMqModule,
        LikeModule,
        AdminModule,
        MatchScoreModule,
        UserModule
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        }
    ]
})
export class AppModule {}
