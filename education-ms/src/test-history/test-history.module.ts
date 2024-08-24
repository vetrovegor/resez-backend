import { Module } from '@nestjs/common';
import { TestHistoryService } from './test-history.service';
import { TestHistoryController } from './test-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestHistory } from './test-history.entity';
import { TaskAttemptModule } from '@task-attempt/task-attempt.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';

@Module({
    imports: [TypeOrmModule.forFeature([TestHistory]), TaskAttemptModule],
    controllers: [TestHistoryController],
    providers: [
        TestHistoryService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        }
    ],
    exports: [TestHistoryService]
})
export class TestHistoryModule {}
