import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SubjectModule } from './subject/subject.module';
import { DatabaseModule } from './database/database.module';
import { SubjectTaskModule } from './subject-task/subject-task.module';
import { SubThemeModule } from './sub-theme/sub-theme.module';
import { ScoreConversionModule } from './score-conversion/score-conversion.module';
import { TaskModule } from './task/task.module';
import { AuthModule } from '@auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UploadModule } from './upload/upload.module';
import { RabbitMqModule } from '@rabbit-mq/rabbit-mq.module';
import { TestModule } from './test/test.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads')
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
        TestModule
    ],
    controllers: [],
    providers: []
})
export class AppModule {}
