import { Module } from '@nestjs/common';
import { TaskAttemptService } from './task-attempt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskAttempt } from './task-attempt.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TaskAttempt])],
    providers: [TaskAttemptService],
    exports: [TaskAttemptService]
})
export class TaskAttemptModule {}
