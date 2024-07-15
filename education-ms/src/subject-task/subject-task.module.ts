import { Module } from '@nestjs/common';
import { SubjectTaskService } from './subject-task.service';
import { SubjectTaskController } from './subject-task.controller';
import { SubjectTask } from './subject-task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([SubjectTask])],
    controllers: [SubjectTaskController],
    providers: [SubjectTaskService],
    exports: [SubjectTaskService]
})
export class SubjectTaskModule {}
