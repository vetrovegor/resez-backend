import { Module } from '@nestjs/common';
import { AdminSubjectController } from './admin-subject.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { SubjectModule } from '@subject/subject.module';
import { ScoreConversionModule } from '@score-conversion/score-conversion.module';
import { TaskModule } from '@task/task.module';
import { SubjectTaskModule } from '@subject-task/subject-task.module';
import { SubThemeModule } from '@sub-theme/sub-theme.module';
import { AdminSubjectTaskController } from './admin-subject-task.controller';
import { AdminTaskController } from './admin-task.controller';

@Module({
    imports: [
        SubjectModule,
        ScoreConversionModule,
        SubjectTaskModule,
        SubThemeModule,
        TaskModule
    ],
    controllers: [
        AdminSubjectController,
        AdminSubjectTaskController,
        AdminTaskController
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        }
    ]
})
export class AdminModule {}
