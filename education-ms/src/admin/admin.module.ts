import { Module } from '@nestjs/common';
import { SubjectController } from './controllers/subject.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { SubjectModule } from '@subject/subject.module';
import { ScoreConversionModule } from '@score-conversion/score-conversion.module';
import { TaskModule } from '@task/task.module';
import { SubjectTaskModule } from '@subject-task/subject-task.module';
import { SubThemeModule } from '@sub-theme/sub-theme.module';
import { SubjectTaskController } from './controllers/subject-task.controller';
import { TaskController } from './controllers/task.controller';
import { UploadController } from './controllers/upload.controller';
import { UploadModule } from '@upload/upload.module';
import { TestModule } from '@test/test.module';
import { TestController } from './controllers/test.controller';
import { LogModule } from '@log/log.module';
import { LogController } from './controllers/log.controller';
import { TaskAnalysisController } from './controllers/task-analysis.controller';
import { TaskAnalysisModule } from '@task-analysis/task-analysis.module';
import { SnippetController } from './controllers/snippet.controller';
import { SnippetModule } from '@snippet/snippet.module';

@Module({
    imports: [
        SubjectModule,
        ScoreConversionModule,
        SubjectTaskModule,
        SubThemeModule,
        TaskModule,
        UploadModule,
        TestModule,
        LogModule,
        TaskAnalysisModule,
        SnippetModule
    ],
    controllers: [
        SubjectController,
        SubjectTaskController,
        TaskController,
        UploadController,
        TestController,
        LogController,
        TaskAnalysisController,
        SnippetController
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        }
    ]
})
export class AdminModule {}
