import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TestHistory } from './test-history.entity';
import { Repository } from 'typeorm';
import { TestSubmitDto } from '@test/dto/test-submit.dto';
import { Test } from '@test/test.entity';
import { TaskAttemptService } from '@task-attempt/task-attempt.service';
import { UserService } from '@user/user.service';
import { AchievementTypes } from '@user/enums';

@Injectable()
export class TestHistoryService {
    constructor(
        @InjectRepository(TestHistory)
        private readonly testHistoryRepository: Repository<TestHistory>,
        private readonly taskAttemptService: TaskAttemptService,
        private readonly userService: UserService
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

        const solvedTestsCount = await this.testHistoryRepository.count({
            where: { userId }
        });

        await this.userService.checkAchievementCompletion(
            userId,
            AchievementTypes.TEST,
            solvedTestsCount
        );
    }

    async find(userId: number, take: number, skip: number, subjectId: number) {
        const where = {
            userId,
            ...(subjectId && { subjectId })
        };

        const [testHistoryData, totalCount] =
            await this.testHistoryRepository.findAndCount({
                where,
                order: { createdAt: 'DESC' },
                take,
                skip
            });

        const history = testHistoryData.map(({ userId, ...item }) => item); // eslint-disable-line

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

        const user = await this.userService.getById(userId);

        const { subjectId, subject, taskAttempts } = history;

        const tasks = taskAttempts.map(taskAttempt => {
            const {
                taskId,
                correctAnswers: answers,
                themeId,
                number,
                theme,
                isDetailedAnswer,
                subThemeId,
                subTheme,
                maxPrimaryScore
            } = taskAttempt;

            delete taskAttempt.id;
            delete taskAttempt.taskId;
            delete taskAttempt.themeId;
            delete taskAttempt.theme;
            delete taskAttempt.number;
            delete taskAttempt.isDetailedAnswer;
            delete taskAttempt.subThemeId;
            delete taskAttempt.subTheme;
            delete taskAttempt.maxPrimaryScore;
            delete taskAttempt.correctAnswers;

            return {
                id: taskId,
                ...taskAttempt,
                answers,
                subjectTask: {
                    id: themeId,
                    number,
                    theme,
                    primaryScore: maxPrimaryScore,
                    isDetailedAnswer
                },
                subTheme: { id: subThemeId, subTheme }
            };
        });

        delete history.userId;
        delete history.subjectId;
        delete history.subject;
        delete history.taskAttempts;

        return {
            history: {
                ...history,
                user,
                subject: { id: subjectId, subject },
                tasks
            }
        };
    }

    async getCountByUserId(userId: number) {
        return await this.testHistoryRepository.count({ where: { userId } });
    }
}
