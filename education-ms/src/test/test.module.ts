import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from './test.entity';
import { SubjectModule } from '@subject/subject.module';
import { TaskModule } from '@task/task.module';
import { TestHistoryModule } from '@test-history/test-history.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Test]),
        SubjectModule,
        TaskModule,
        TestHistoryModule
    ],
    controllers: [TestController],
    providers: [TestService],
    exports: [TestService]
})
export class TestModule {}
