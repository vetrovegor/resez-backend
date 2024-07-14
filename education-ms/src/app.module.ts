import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SubjectModule } from './subject/subject.module';
import { DatabaseModule } from './database/database.module';
import { SubjectTaskModule } from './subject-task/subject-task.module';
import { SubThemeModule } from './sub-theme/sub-theme.module';
import { ScoreConversionModule } from './score-conversion/score-conversion.module';
import { TaskModule } from './task/task.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from '@auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        SubjectModule,
        DatabaseModule,
        SubjectTaskModule,
        SubThemeModule,
        ScoreConversionModule,
        TaskModule,
        AuthModule,
        AdminModule
    ],
    controllers: [],
    providers: []
})
export class AppModule {}
