import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RabbitMqModule } from '@rabbit-mq/rabbit-mq.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigService } from '@nestjs/config';
import { LogModule } from '@log/log.module';
import { UserModule } from '@user/user.module';
import { SubjectModule } from '@subject/subject.module';
import { DatabaseModule } from './database/database.module';
import { SubjectTaskModule } from '@subject-task/subject-task.module';
import { SubThemeModule } from '@sub-theme/sub-theme.module';
import { ScoreConversionModule } from '@score-conversion/score-conversion.module';
import { TaskModule } from '@task/task.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from '@upload/upload.module';
import { TestModule } from '@test/test.module';
import { TestHistoryModule } from '@test-history/test-history.module';
import { TaskAttemptModule } from '@task-attempt/task-attempt.module';
import { TaskAnalysisModule } from '@task-analysis/task-analysis.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads')
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: (configService: ConfigService) => ({
                store: redisStore,
                host: configService.get('REDIS_HOST'),
                port: configService.get('REDIS_PORT'),
                ttl: 10
            }),
            inject: [ConfigService]
        }),
        SubjectModule,
        DatabaseModule,
        SubjectTaskModule,
        SubThemeModule,
        ScoreConversionModule,
        TaskModule,
        AuthModule,
        AdminModule,
        UploadModule,
        RabbitMqModule,
        TestModule,
        TestHistoryModule,
        TaskAttemptModule,
        LogModule,
        UserModule,
        TaskAnalysisModule
    ],
    controllers: [],
    providers: []
})
export class AppModule {}
