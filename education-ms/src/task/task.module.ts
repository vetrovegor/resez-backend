import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { SubjectModule } from '@subject/subject.module';
import { SnippetModule } from '@snippet/snippet.module';
import { SourceModule } from '@source/source.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Task]),
        forwardRef(() => SubjectModule),
        SnippetModule,
        SourceModule
    ],
    controllers: [TaskController],
    providers: [TaskService],
    exports: [TaskService]
})
export class TaskModule {}
