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

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @Inject(forwardRef(() => SubjectService))
        private readonly subjectService: SubjectService
    ) {}

    async create(dto: TaskDto, userId: number) {
        const existingSubject = await this.subjectService.getById(
            dto.subjectId
        );

        const subjectTask = existingSubject.subjectTasks.find(
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

        return savedTask;
    }

    createShortInfo(task: Task) {
        // получить инфу о пользователе?
        const { subject } = task.subject;
        const { number, theme } = task.subjectTask;
        const { subTheme } = task.subTheme;

        delete task.solution;
        delete task.subjectTask;

        return {
            ...task,
            number,
            subject,
            theme,
            subTheme
        };
    }

    async find(
        take: number,
        skip: number,
        subjectId: number,
        subjectTaskId: number,
        subThemeId: number,
        userId: number
    ) {
        const where = {
            ...(subjectId && {
                subject: { id: subjectId }
            }),
            ...(subjectTaskId && {
                subjectTask: { id: subjectTaskId }
            }),
            ...(subThemeId && {
                subTheme: { id: subThemeId }
            }),
            ...(userId && {
                userId
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
            tasksData.map(async task => this.createShortInfo(task))
        );

        const totalCount = await this.taskRepository.count({ where });

        return {
            tasks,
            totalCount,
            isLast: totalCount <= take + skip,
            elementsCount: tasksData.length
        };
    }
}
