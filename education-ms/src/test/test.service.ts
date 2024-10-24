import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Test } from './test.entity';
import { Repository } from 'typeorm';
import { ExamTestDto } from './dto/exam-test.dto';
import { SubjectService } from '@subject/subject.service';
import { TaskService } from '@task/task.service';
import { CustomTestDto } from './dto/custom-test.dto';
import { TestSubmitDto } from './dto/test-submit.dto';
import { arraysEqualSet } from '@utils/array-equal-set';
import { TestHistoryService } from '@test-history/test-history.service';
import { UserService } from '@user/user.service';
import { TaskReplaceDto } from './dto';

@Injectable()
export class TestService {
    constructor(
        @InjectRepository(Test)
        private readonly testRepository: Repository<Test>,
        private readonly subjectService: SubjectService,
        private readonly taskService: TaskService,
        private readonly testHistoryService: TestHistoryService,
        private readonly userService: UserService
    ) {}

    async create(dto: ExamTestDto, userId: number, isExam: boolean) {
        const createdTest = this.testRepository.create({
            ...dto,
            subject: { id: dto.subjectId },
            userId,
            isExam
        });

        return await this.testRepository.save(createdTest);
    }

    async generateExamTest(dto: ExamTestDto, userId: number) {
        const { subjectTasks } = await this.subjectService.getById(
            dto.subjectId
        );

        for (const { tasksCount } of subjectTasks) {
            if (tasksCount == 0) {
                throw new BadRequestException(
                    'В базе недостаточно заданий для генерации теста'
                );
            }
        }

        const createdTest = await this.create(dto, userId, true);

        const tasks = await Promise.all(
            subjectTasks.map(async ({ id }) => {
                return await this.taskService.generateRandomVerifiedBySubjectTaskId(
                    id
                );
            })
        );

        createdTest.tasks = tasks;
        await this.testRepository.save(createdTest);

        return { test: createdTest };
    }

    async generateCustomTest(dto: CustomTestDto, userId: number) {
        const { subjectTasks } = await this.subjectService.getById(
            dto.subjectId
        );

        let availableTasksCount = 0;

        for (const { id, subThemeIds } of dto.subjectTasks) {
            const existingSubjectTask = subjectTasks.find(
                subjectTask => subjectTask.id === id
            );

            if (!existingSubjectTask) {
                throw new NotFoundException('Задание предмета не найдено');
            }

            for (const subThemeId of subThemeIds) {
                const existingSubTheme = existingSubjectTask.subThemes.find(
                    subTheme => subTheme.id == subThemeId
                );

                if (!existingSubTheme) {
                    throw new NotFoundException('Подтема не найдена');
                }

                availableTasksCount += existingSubTheme.tasksCount;
            }
        }

        if (availableTasksCount === 0) {
            throw new BadRequestException(
                'В базе недостаточно заданий для генерации теста'
            );
        }

        const createdTest = await this.create(dto, userId, false);

        const taskArrs = await Promise.all(
            dto.subjectTasks.map(async ({ subThemeIds, count }) => {
                return await this.taskService.generateRandomVerifiedBySubthemeIds(
                    subThemeIds,
                    count
                );
            })
        );

        const tasks = taskArrs.reduce((acc, curr) => acc.concat(curr), []);

        createdTest.tasks = tasks;
        await this.testRepository.save(createdTest);

        return { test: createdTest };
    }

    createShortInfo(test: Test) {
        const tasksCount = test.tasks.length;

        delete test.tasks;
        delete test.userId;

        return {
            ...test,
            subject: test.subject.subject,
            tasksCount
        };
    }

    async find(
        take: number,
        skip: number,
        subjectId: number,
        userId: number,
        isOfficial: boolean
    ) {
        const where = {
            ...(subjectId && { subject: { id: subjectId } }),
            ...(userId && { userId }),
            ...(isOfficial != undefined && { isOfficial })
        };

        const testsData = await this.testRepository.find({
            where,
            order: { createdAt: 'DESC' },
            relations: ['subject', 'tasks'],
            take,
            skip
        });

        const tests = testsData.map(test => this.createShortInfo(test));

        const totalCount = await this.testRepository.count({
            where
        });

        return {
            tests,
            totalCount,
            isLast: totalCount <= take + skip,
            elementsCount: tests.length
        };
    }

    async findOfficialBySubjectSlug(
        take: number,
        skip: number,
        subjectSlug: string
    ) {
        const { id } = await this.subjectService.getBySlug(subjectSlug);

        const where = {
            isOfficial: true,
            subject: { id }
        };

        const testsData = await this.testRepository.find({
            where,
            order: { createdAt: 'DESC' },
            relations: ['subject', 'tasks'],
            take,
            skip
        });

        const tests = testsData.map(test => this.createShortInfo(test));

        const totalCount = await this.testRepository.count({
            where
        });

        return {
            tests,
            totalCount,
            isLast: totalCount <= take + skip,
            elementsCount: tests.length
        };
    }

    async getFullInfo(id: number) {
        const test = await this.testRepository.findOne({
            where: { id },
            relations: [
                'subject',
                'tasks',
                'tasks.subjectTask',
                'tasks.subTheme'
            ],
            order: { tasks: { subjectTask: { number: 'ASC' } } }
        });

        if (!test) {
            throw new NotFoundException('Тест не найден');
        }

        // TODO: сразу деструктуризировать
        const tasks = test.tasks.map(taskItem => {
            const { id, task, subjectTask, subTheme } = taskItem;
            // const {
            //     number = null,
            //     theme = null,
            //     isDetailedAnswer
            // } = subjectTask || {};

            return {
                id,
                subjectTask,
                subTheme,
                task
            };
        });

        const user = await this.userService.getById(test.userId);

        delete test.userId;

        const { subject, durationMinutes } = test.subject;

        return {
            ...test,
            subject,
            durationMinutes,
            user,
            tasksCount: tasks.length,
            tasks
        };
    }

    async delete(id: number) {
        const existingTest = await this.testRepository.findOne({
            where: { id }
        });

        if (!existingTest) {
            throw new NotFoundException('Тест не найден');
        }

        await this.testRepository.remove(existingTest);

        return { test: existingTest };
    }

    async getDetailedTasksByTestId(id: number) {
        const existingTest = await this.testRepository.findOne({
            where: { id },
            relations: [
                'tasks',
                'tasks.subject',
                'tasks.subjectTask',
                'tasks.subTheme'
            ],
            order: { tasks: { subjectTask: { number: 'ASC' } } }
        });

        if (!existingTest) {
            throw new NotFoundException('Тест не найден');
        }

        const tasks = existingTest.tasks.filter(
            task => task.subjectTask.isDetailedAnswer
        );

        return { tasks };
    }

    async evaluate(id: number, dto: TestSubmitDto, userId: number) {
        const existingTest = await this.testRepository.findOne({
            where: { id },
            relations: [
                'subject',
                'subject.scoreConversions',
                'tasks',
                'tasks.subjectTask',
                'tasks.subTheme',
                'tasks.subject'
            ]
        });

        if (!existingTest) {
            throw new NotFoundException('Тест не найден');
        }

        const { simpleTasks, detailedTasks } = dto;

        const testSimpleTaskIds = existingTest.tasks
            .filter(task => !task.subjectTask.isDetailedAnswer)
            .map(task => task.id);

        const submittedSimpleTaskIds = simpleTasks.map(task => task.id);

        const testDetailedTaskIds = existingTest.tasks
            .filter(task => task.subjectTask.isDetailedAnswer)
            .map(task => task.id);

        const submittedDetailedTaskIds = detailedTasks.map(task => task.id);

        if (
            !arraysEqualSet(testSimpleTaskIds, submittedSimpleTaskIds) ||
            !arraysEqualSet(testDetailedTaskIds, submittedDetailedTaskIds)
        ) {
            throw new BadRequestException(
                'Переданные задания не совпадают с заданиями в тесте'
            );
        }

        for (const { id, primaryScore } of detailedTasks) {
            const taskData = existingTest.tasks.find(task => task.id == id);

            if (primaryScore > taskData.subjectTask.primaryScore) {
                throw new BadRequestException(
                    'Первичный балл больше чем возможно'
                );
            }
        }

        let totalPrimaryScore = 0;
        let maxPrimaryScore = 0;

        const simpleTasksResult = simpleTasks.map(({ id, answer }) => {
            const { answers: correctAnswers, subjectTask } =
                existingTest.tasks.find(task => task.id == id) || {
                    answers: [],
                    subjectTask: {}
                };

            const existingAnswer = correctAnswers.find(
                item => item.toLowerCase() === answer.toLowerCase()
            );

            const isCorrect = !!existingAnswer;
            const primaryScore = isCorrect ? subjectTask.primaryScore : 0;

            totalPrimaryScore += primaryScore;
            maxPrimaryScore += subjectTask.primaryScore;

            return {
                id,
                number: subjectTask.number,
                answer,
                isCorrect,
                correctAnswers,
                primaryScore
            };
        });

        const detailedTasksResult = detailedTasks.map(
            ({ id, primaryScore }) => {
                const { subjectTask } = existingTest.tasks.find(
                    task => task.id == id
                );

                totalPrimaryScore += primaryScore;
                maxPrimaryScore += subjectTask.primaryScore;

                return {
                    id,
                    number: subjectTask.number,
                    primaryScore,
                    maxPrimaryScore: subjectTask.primaryScore
                };
            }
        );

        const { subject, isExam } = existingTest;
        const { scoreConversions, isMark } = subject;

        const gradeEntry = scoreConversions.find(
            item =>
                totalPrimaryScore >= item.minScore &&
                totalPrimaryScore <= item.maxScore
        );
        const grade = isMark && gradeEntry ? gradeEntry.grade : 0;

        const secondaryScoreEntry = scoreConversions.find(
            item => item.primaryScore == totalPrimaryScore
        );
        const secondaryScore =
            !isMark && secondaryScoreEntry
                ? secondaryScoreEntry.secondaryScore
                : 0;

        // сохранение результатов
        if (userId != -1) {
            await this.testHistoryService.save(
                userId,
                dto,
                existingTest,
                maxPrimaryScore,
                totalPrimaryScore,
                secondaryScore,
                grade
            );
        }

        return {
            isExam,
            isMark,
            secondsSpent: dto.secondsSpent,
            simpleTasks: simpleTasksResult,
            detailedTasks: detailedTasksResult,
            primaryScore: totalPrimaryScore,
            maxPrimaryScore,
            grade,
            secondaryScore
        };
    }

    async replaceTask(id: number, { oldTaskId, newTaskId }: TaskReplaceDto) {
        const existingTest = await this.testRepository.findOne({
            where: { id },
            relations: ['tasks', 'tasks.subjectTask']
        });

        if (!existingTest) {
            throw new NotFoundException('Тест не найден');
        }

        const existingTestTask = existingTest.tasks.find(
            task => task.id == oldTaskId
        );

        if (!existingTestTask) {
            throw new NotFoundException('Задание отсутствует в тесте');
        }

        const newTask = await this.taskService.getById(newTaskId);

        if (newTask.subjectTask.id != existingTestTask.subjectTask.id) {
            throw new NotFoundException(
                'Тема нового задания должна совпадать с темой старого'
            );
        }

        existingTest.tasks = existingTest.tasks.map(task =>
            task.id == oldTaskId ? newTask : task
        );

        return await this.testRepository.save(existingTest);
    }
}
