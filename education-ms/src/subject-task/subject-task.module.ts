import { Module } from '@nestjs/common';
import { SubjectTaskService } from './subject-task.service';
import { SubjectTaskController } from './subject-task.controller';
import { SubjectTask } from './subject-task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubThemeModule } from '@sub-theme/sub-theme.module';
import { TaskModule } from '@task/task.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([SubjectTask]),
        SubThemeModule,
        TaskModule
    ],
    controllers: [SubjectTaskController],
    providers: [SubjectTaskService],
    exports: [SubjectTaskService]
})
export class SubjectTaskModule {}
