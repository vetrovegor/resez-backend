import { Injectable, NotFoundException } from '@nestjs/common';
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

    async find(userId: number, take: number, skip: number, subjectId: number) {
        const where = {
            userId,
            ...(subjectId && { subjectId })
        };

        const testHistoryData = await this.testHistoryRepository.find({
            where,
            order: { createdAt: 'DESC' },
            take,
            skip
        });

        const history = testHistoryData.map(({ userId, ...item }) => item); // eslint-disable-line

        const totalCount = await this.testHistoryRepository.count({
            where
        });

        return {
            history,
            totalCount,
            isLast: totalCount <= take + skip,
            elementsCount: testHistoryData.length
        };
    }

    async getById(id: number, userId: number) {
        const history = await this.testHistoryRepository.findOne({
            where: {
                id,
                userId
            },
            relations: ['taskAttempts']
        });

        if (!history) {
            throw new NotFoundException('Решение теста не найдено');
        }

        delete history.userId;

        return { history };
    }
}
