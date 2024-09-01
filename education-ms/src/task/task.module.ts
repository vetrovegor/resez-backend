import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { SubjectModule } from '@subject/subject.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Task]),
        forwardRef(() => SubjectModule)
    ],
    controllers: [TaskController],
    providers: [TaskService],
    exports: [TaskService]
})
export class TaskModule {}
