import { forwardRef, Module } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from './subject.entity';
import { ScoreConversionModule } from '@score-conversion/score-conversion.module';
import { SubjectTaskModule } from '@subject-task/subject-task.module';
import { TaskModule } from '@task/task.module';
import { TaskAnalysisModule } from '@task-analysis/task-analysis.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Subject]),
        forwardRef(() => ScoreConversionModule),
        forwardRef(() => TaskModule),
        SubjectTaskModule,
        TaskAnalysisModule
    ],
    controllers: [SubjectController],
    providers: [SubjectService],
    exports: [SubjectService]
})
export class SubjectModule {}
