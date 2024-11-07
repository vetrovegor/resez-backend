import { Module } from '@nestjs/common';
import { TaskAnalysisService } from './task-analysis.service';
import { TaskAnalysisController } from './task-analysis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskAnalysis } from './task-analysis.entity';
import { SubjectTaskModule } from '@subject-task/subject-task.module';

@Module({
    imports: [TypeOrmModule.forFeature([TaskAnalysis]), SubjectTaskModule],
    controllers: [TaskAnalysisController],
    providers: [TaskAnalysisService],
    exports: [TaskAnalysisService]
})
export class TaskAnalysisModule {}
