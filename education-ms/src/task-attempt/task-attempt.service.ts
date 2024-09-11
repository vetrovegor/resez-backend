import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskAttempt } from './task-attempt.entity';
import { Repository } from 'typeorm';
import { TestSubmitDto } from '@test/dto/test-submit.dto';
import { Test } from '@test/test.entity';
import { TestHistory } from '@test-history/test-history.entity';

@Injectable()
export class TaskAttemptService {
    constructor(
        @InjectRepository(TaskAttempt)
        private readonly taskAttemptRepository: Repository<TaskAttempt>
    ) {}

    async save(dto: TestSubmitDto, test: Test, testHistory: TestHistory) {
        const testTasks = test.tasks;

        for (const { id: taskId, answer: userAnswer } of dto.simpleTasks) {
            const {
                subjectTask,
                subTheme,
                task,
                solution,
                answers: correctAnswers,
                source
            } = testTasks.find(task => task.id == taskId);

            const existingAnswer = correctAnswers.find(
                item => item.toLowerCase() === userAnswer.toLowerCase()
            );

            const isCorrect = !!existingAnswer;
            const primaryScore = isCorrect ? subjectTask.primaryScore : 0;

            await this.taskAttemptRepository.save({
                taskId,
                themeId: subjectTask.id,
                number: subjectTask.number,
                theme: subjectTask.theme,
                isDetailedAnswer: subjectTask.isDetailedAnswer,
                subThemeId: subTheme.id,
                subTheme: subTheme.subTheme,
                task,
                solution,
                correctAnswers,
                maxPrimaryScore: subjectTask.primaryScore,
                source,
                userAnswer,
                isCorrect,
                primaryScore,
                testHistory
            });
        }

        for (const { id: taskId, primaryScore } of dto.detailedTasks) {
            const {
                subjectTask,
                subTheme,
                task,
                solution,
                answers: correctAnswers,
                source
            } = testTasks.find(task => task.id == taskId);

            await this.taskAttemptRepository.save({
                taskId,
                themeId: subjectTask.id,
                number: subjectTask.number,
                theme: subjectTask.theme,
                isDetailedAnswer: subjectTask.isDetailedAnswer,
                subThemeId: subTheme.id,
                subTheme: subTheme.subTheme,
                task,
                solution,
                correctAnswers,
                maxPrimaryScore: subjectTask.primaryScore,
                source,
                primaryScore,
                testHistory
            });
        }
    }
}
