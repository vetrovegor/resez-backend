import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TestHistory } from './test-history.entity';
import { Repository } from 'typeorm';
import { TestSubmitDto } from '@test/dto/test-submit.dto';
import { Test } from '@test/test.entity';
import { TaskAttemptService } from '@task-attempt/task-attempt.service';

@Injectable()
export class TestHistoryService {
    constructor(
        @InjectRepository(TestHistory)
        private readonly testHistoryRepository: Repository<TestHistory>,
        private readonly taskAttemptService: TaskAttemptService
    ) {}

    async save(
        userId: number,
        dto: TestSubmitDto,
        test: Test,
        maxPrimaryScore: number,
        primaryScore: number,
        secondaryScore: number,
        grade: number
    ) {
        const { subject } = test;

        const secondsSpent =
            dto.secondsSpent / 60 > subject.durationMinutes
                ? subject.durationMinutes * 60
                : dto.secondsSpent;

        const savedTestHistory = await this.testHistoryRepository.save({
            userId,
            testId: test.id,
            subjectId: subject.id,
            subject: subject.subject,
            durationMinutes: subject.durationMinutes,
            maxPrimaryScore,
            secondsSpent,
            primaryScore,
            secondaryScore,
            grade
        });

        await this.taskAttemptService.save(dto, test, savedTestHistory);
    }
}
