import { Module } from '@nestjs/common';
import { TestHistoryService } from './test-history.service';
import { TestHistoryController } from './test-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestHistory } from './test-history.entity';
import { TaskAttemptModule } from '@task-attempt/task-attempt.module';

@Module({
    imports: [TypeOrmModule.forFeature([TestHistory]), TaskAttemptModule],
    controllers: [TestHistoryController],
    providers: [TestHistoryService],
    exports: [TestHistoryService]
})
export class TestHistoryModule {}
