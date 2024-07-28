import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Test } from './test.entity';
import { Repository } from 'typeorm';
import { ExamTestDto } from './dto/exam-test.dto';
import { SubjectService } from '@subject/subject.service';
import { TaskService } from '@task/task.service';
import { RabbitMqService } from '@rabbit-mq/rabbit-mq.service';
import { ClientProxy } from '@nestjs/microservices';
import { CustomTestDto } from './dto/custom-test.dto';

@Injectable()
export class TestService {
    constructor(
        @InjectRepository(Test)
        private readonly testRepository: Repository<Test>,
        private readonly subjectService: SubjectService,
        private readonly taskService: TaskService,
        private readonly rabbitMqService: RabbitMqService,
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy
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
            ]
        });

        if (!test) {
            throw new NotFoundException('Тест не найден');
        }

        const tasks = test.tasks.map(taskItem => {
            const { id, task, subjectTask, subTheme } = taskItem;
            const { number, theme, isDetailedAnswer } = subjectTask;

            return {
                id,
                number,
                theme,
                subTheme: subTheme.subTheme,
                isDetailedAnswer,
                task
            };
        });

        const user = await this.rabbitMqService.sendRequest({
            client: this.userClient,
            pattern: 'preview',
            data: test.userId
        });

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
}
