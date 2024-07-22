import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { TaskDto } from './dto/task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { SubjectService } from '@subject/subject.service';
import { RabbitMqService } from '@rabbit-mq/rabbit-mq.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @Inject(forwardRef(() => SubjectService))
        private readonly subjectService: SubjectService,
        private readonly rabbitMqService: RabbitMqService,
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy
    ) {}

    async create(dto: TaskDto, userId: number) {
        // вынести
        const subject = await this.subjectService.getById(dto.subjectId);

        const subjectTask = subject.subjectTasks.find(
            subjectTask => subjectTask.id == dto.subjectTaskId
        );

        if (!subjectTask) {
            throw new NotFoundException('Задание предмета не найдено');
        }

        const subTheme = subjectTask.subThemes.find(
            subTheme => subTheme.id == dto.subThemeId
        );

        if (!subTheme) {
            throw new NotFoundException('Подтема не найдена');
        }

        if (subjectTask.isDetailedAnswer && !dto.solution) {
            throw new BadRequestException(
                'Задание с развернутым ответом должно содержать решение'
            );
        }

        if (!subjectTask.isDetailedAnswer && !dto.answer) {
            throw new BadRequestException(
                'Задание без развернутого ответа должно содержать ответ'
            );
        }

        const createdTask = this.taskRepository.create({
            ...dto,
            subject: { id: dto.subjectId },
            subjectTask: { id: dto.subjectTaskId },
            subTheme: { id: dto.subThemeId },
            userId
        });

        const savedTask = await this.taskRepository.save(createdTask);

        return { task: savedTask };
    }

    async createShortInfo(task: Task) {
        // получить инфу о пользователе?
        const { subject } = task.subject;
        const { number, theme } = task.subjectTask;
        const { subTheme } = task.subTheme;
        const user = await this.rabbitMqService.sendRequest({
            client: this.userClient,
            pattern: 'preview',
            data: task.userId
        });

        delete task.solution;
        delete task.subjectTask;
        delete task.userId;

        return {
            ...task,
            number,
            subject,
            theme,
            subTheme,
            user
        };
    }

    async find(
        take: number,
        skip: number,
        isArchived: boolean,
        subjectId?: number,
        subjectTaskId?: number,
        subThemeId?: number,
        userId?: number,
        isVerified?: boolean
    ) {
        const where = {
            isArchived,
            ...(subjectId != undefined && {
                subject: { id: subjectId }
            }),
            ...(subjectTaskId != undefined && {
                subjectTask: { id: subjectTaskId }
            }),
            ...(subThemeId != undefined && {
                subTheme: { id: subThemeId }
            }),
            ...(userId != undefined && {
                userId
            }),
            ...(isVerified != undefined && {
                isVerified
            })
        };

        const tasksData = await this.taskRepository.find({
            where,
            order: { createdAt: 'DESC' },
            take,
            skip,
            relations: ['subject', 'subjectTask', 'subTheme']
        });

        const tasks = await Promise.all(
            tasksData.map(async task => await this.createShortInfo(task))
        );

        const totalCount = await this.taskRepository.count({ where });

        return {
            tasks,
            totalCount,
            isLast: totalCount <= take + skip,
            elementsCount: tasksData.length
        };
    }

    async getById(id: number) {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ['subject', 'subjectTask', 'subTheme']
        });

        if (!task) {
            throw new NotFoundException('Задание не найдено');
        }

        return task;
    }

    async getAdminInfo(id: number) {
        const task = await this.getById(id);

        return { task };
    }

    async update(id: number, dto: TaskDto) {
        await this.getById(id);

        // вынести
        const subject = await this.subjectService.getById(dto.subjectId);

        const subjectTask = subject.subjectTasks.find(
            subjectTask => subjectTask.id == dto.subjectTaskId
        );

        if (!subjectTask) {
            throw new NotFoundException('Задание предмета не найдено');
        }

        const subTheme = subjectTask.subThemes.find(
            subTheme => subTheme.id == dto.subThemeId
        );

        if (!subTheme) {
            throw new NotFoundException('Подтема не найдена');
        }

        if (subjectTask.isDetailedAnswer && !dto.solution) {
            throw new BadRequestException(
                'Задание с развернутым ответом должно содержать решение'
            );
        }

        if (!subjectTask.isDetailedAnswer && !dto.answer) {
            throw new BadRequestException(
                'Задание без развернутого ответа должно содержать ответ'
            );
        }

        const savedTask = await this.taskRepository.save({
            id,
            ...dto,
            subject: { id: dto.subjectId },
            subjectTask: { id: dto.subjectTaskId },
            subTheme: { id: dto.subThemeId }
        });

        return { task: savedTask };
    }

    async toggleIsVerified(id: number) {
        const task = await this.getById(id);

        const isVerified = !task.isVerified;

        await this.taskRepository.update(id, {
            isVerified
        });

        return { task: { ...task, isVerified } };
    }

    async toggleIsArchived(id: number, isArchived: boolean) {
        const task = await this.getById(id);

        await this.taskRepository.update(id, { isArchived });

        return { task: { ...task, isArchived } };
    }

    async delete(id: number) {
        const task = await this.getById(id);

        await this.taskRepository.remove(task);

        return { task };
    }
}
