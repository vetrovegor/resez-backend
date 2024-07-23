import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Test } from './test.entity';
import { Repository } from 'typeorm';
import { TestDto } from './dto/test.dto';
import { SubjectService } from '@subject/subject.service';
import { TaskService } from '@task/task.service';
import { RabbitMqService } from '@rabbit-mq/rabbit-mq.service';
import { ClientProxy } from '@nestjs/microservices';

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

    async create(dto: TestDto, userId: number, isExam: boolean) {
        const createdTest = this.testRepository.create({
            ...dto,
            subject: { id: dto.subjectId },
            userId,
            isExam
        });

        return await this.testRepository.save(createdTest);
    }

    async generateExamTest(dto: TestDto, userId: number) {
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
                return await this.taskService.getRandomVerifiedBySubjectTaskId(
                    id
                );
            })
        );

        createdTest.tasks = tasks;
        await this.testRepository.save(createdTest);

        return { test: createdTest };
    }

    async find(
        take: number,
        skip: number,
        subjectId: number,
        userId: number,
        isOfficial: boolean
    ) {
        const where = {
            ...(isOfficial != undefined && { isOfficial }),
            ...(subjectId && { subject: { id: subjectId } }),
            ...(userId && { userId })
        };

        const testsData = await this.testRepository.find({
            where,
            order: { createdAt: 'DESC' },
            relations: ['subject', 'tasks'],
            take,
            skip
        });

        const tests = testsData.map(test => {
            const tasksCount = test.tasks.length;
            delete test.tasks;
            delete test.userId;

            return {
                ...test,
                subject: test.subject.subject,
                tasksCount
            };
        });

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

        return {
            ...test,
            subject: test.subject.subject,
            user,
            tasks
        };
    }
}
