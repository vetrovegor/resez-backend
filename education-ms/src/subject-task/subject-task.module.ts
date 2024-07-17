import { Module } from '@nestjs/common';
import { SubjectTaskService } from './subject-task.service';
import { SubjectTaskController } from './subject-task.controller';
import { SubjectTask } from './subject-task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubThemeModule } from '@sub-theme/sub-theme.module';

@Module({
    imports: [TypeOrmModule.forFeature([SubjectTask]), SubThemeModule],
    controllers: [SubjectTaskController],
    providers: [SubjectTaskService],
    exports: [SubjectTaskService]
})
export class SubjectTaskModule {}
