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
import { In, Not, Repository } from 'typeorm';
import { SubjectService } from '@subject/subject.service';
import { MatchDto } from './dto/match.dto';
import * as stringSimilarity from 'string-similarity';
import { JwtPayload, Permissions } from '@auth/interfaces/interfaces';
import { LogService } from '@log/log.service';
import { LogType } from '@log/log.entity';
import { UserService } from '@user/user.service';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @Inject(forwardRef(() => SubjectService))
        private readonly subjectService: SubjectService,
        private readonly logService: LogService,
        private readonly userService: UserService
    ) {}

    async create(dto: TaskDto, user: JwtPayload) {
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

        if (!subjectTask.isDetailedAnswer && !dto.answers.length) {
            throw new BadRequestException(
                'Задание без развернутого ответа должно содержать ответ'
            );
        }

        const hasVerifiedPermission = user.permissions.some(
            permission => permission.permission == Permissions.VerifyTasks
        );

        const createdTask = this.taskRepository.create({
            ...dto,
            isVerified: hasVerifiedPermission ? dto.isVerified : false,
            subject: { id: dto.subjectId },
            subjectTask: { id: dto.subjectTaskId },
            subTheme: { id: dto.subThemeId },
            userId: user.id
        });

        const savedTask = await this.taskRepository.save(createdTask);

        const { task: fullInfo } = await this.getFullInfoById(
            savedTask.id,
            false
        );

        await this.logService.create(
            LogType.CREATE_TASK,
            user.id,
            savedTask.id,
            JSON.stringify({ ...fullInfo })
        );

        return { task: savedTask };
    }

    async createShortInfo(task: Task) {
        const { subject = null } = task.subject || {};
        const { number = null, theme = null } = task.subjectTask || {};
        const { subTheme = null } = task.subTheme || {};
        const user = await this.userService.getById(task.userId);

        delete task.solution;
        delete task.answers;
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

    async findBySubThemeId(subThemeId: number, take: number, skip: number) {
        const where = {
            isVerified: true,
            isArchived: false,
            subTheme: { id: subThemeId }
        };

        const tasks = await this.taskRepository.find({
            where,
            order: { createdAt: 'DESC' },
            take,
            skip,
            relations: ['subject', 'subjectTask', 'subTheme']
        });

        const totalCount = await this.taskRepository.count({ where });

        return {
            tasks,
            totalCount,
            isLast: totalCount <= take + skip,
            elementsCount: tasks.length
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

    async getFullInfoById(id: number, isAccessCheck: boolean = true) {
        const task = await this.getById(id);

        if (isAccessCheck && (!task.isVerified || task.isArchived)) {
            throw new NotFoundException('Задание не найдено');
        }

        task.answers = task.answers.filter(answer => answer.length > 0);

        task['user'] = await this.userService.getById(task.userId);

        delete task.userId;

        return { task };
    }

    async update(id: number, dto: TaskDto, user: JwtPayload) {
        const { task: oldFullInfo } = await this.getFullInfoById(id, false);

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

        if (!subjectTask.isDetailedAnswer && !dto.answers.length) {
            throw new BadRequestException(
                'Задание без развернутого ответа должно содержать ответ'
            );
        }

        const hasVerifiedPermission = user.permissions.some(
            permission => permission.permission == Permissions.VerifyTasks
        );

        const savedTask = await this.taskRepository.save({
            id,
            ...dto,
            isVerified: hasVerifiedPermission ? dto.isVerified : false,
            subject: { id: dto.subjectId },
            subjectTask: { id: dto.subjectTaskId },
            subTheme: { id: dto.subThemeId }
        });

        const { task: newFullInfo } = await this.getFullInfoById(id, false);

        await this.logService.create(
            LogType.UPDATE_TASK,
            user.id,
            savedTask.id,
            JSON.stringify({ ...newFullInfo }),
            JSON.stringify({ ...oldFullInfo })
        );

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
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ['tests']
        });

        if (!task) {
            throw new NotFoundException('Задание не найдено');
        }

        if (isArchived && task.tests.length > 0) {
            throw new BadRequestException(
                'Нельзя архивировать задание, т.к. оно присутствует в тесте'
            );
        }

        await this.taskRepository.update(id, { isArchived, isVerified: false });

        return { task: { ...task, isArchived } };
    }

    // вынести в общий метод
    async archiveTasksBySubjectTasksIds(
        subjectId: number,
        subjectTasksIds: number[]
    ) {
        console.log({
            method: 'archiveTasksBySubjectTasksIds',
            subjectId,
            subjectTasksIds
        });
        await this.taskRepository.update(
            {
                subject: { id: subjectId },
                subjectTask: { id: Not(In(subjectTasksIds)) }
            },
            {
                subjectTask: null,
                subTheme: null,
                isVerified: false,
                isArchived: true
            }
        );
    }

    // вынести в общий метод
    async archiveTasksBySubThemeIds(
        subjectTaskId: number,
        subThemeIds: number[]
    ) {
        console.log({
            method: 'archiveTasksBySubThemeIds',
            subjectTaskId,
            subThemeIds
        });
        await this.taskRepository.update(
            {
                subjectTask: { id: subjectTaskId },
                subTheme: { id: Not(In(subThemeIds)) }
            },
            { subTheme: null, isVerified: false, isArchived: true }
        );
    }

    async delete(id: number) {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ['tests']
        });

        if (!task) {
            throw new NotFoundException('Задание не найдено');
        }

        if (task.tests.length > 0) {
            throw new BadRequestException(
                'Нельзя архивировать задание, т.к. оно присутствует в тесте'
            );
        }

        await this.taskRepository.remove(task);

        return { task };
    }

    async getVerifiedTasksCountBySubjectId(subjectId: number) {
        return await this.taskRepository.count({
            where: {
                subject: { id: subjectId },
                isVerified: true,
                isArchived: false
            }
        });
    }

    async getVerifiedTasksCountBySubThemeId(subThemeId: number) {
        return await this.taskRepository.count({
            where: {
                subTheme: { id: subThemeId },
                isVerified: true,
                isArchived: false
            }
        });
    }

    async generateRandomVerifiedBySubjectTaskId(subjectTaskId: number) {
        return await this.taskRepository
            .createQueryBuilder('task')
            .where('task.subjectTask.id = :subjectTaskId', { subjectTaskId })
            .andWhere('task.isVerified = true')
            .andWhere('task.isArchived = false')
            .orderBy('RANDOM()')
            .limit(1)
            .getOne();
    }

    async generateRandomVerifiedBySubthemeIds(
        subThemeIds: number[],
        limit: number
    ) {
        return await this.taskRepository
            .createQueryBuilder('task')
            .innerJoin('task.subTheme', 'subTheme')
            .where('subTheme.id IN (:...subThemeIds)', { subThemeIds })
            .andWhere('task.isVerified = true')
            .andWhere('task.isArchived = false')
            .orderBy('RANDOM()')
            .limit(limit)
            .getMany();
    }

    async findMatches(dto: MatchDto) {
        const where = {
            subject: { id: dto.subjectId },
            ...(dto.excludeTaskId && {
                id: Not(dto.excludeTaskId)
            })
        };

        const tasksData = await this.taskRepository.find({
            where,
            relations: ['subject', 'subjectTask', 'subTheme']
        });

        if (tasksData.length == 0) {
            return { matches: [] };
        }

        const tasksContent = tasksData.map(task => task.task);

        const matchesData = stringSimilarity.findBestMatch(
            dto.task,
            tasksContent
        );

        const topMatches = matchesData.ratings
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3);

        const matches = await Promise.all(
            topMatches.map(async match => {
                const taskData = tasksData.find(
                    task => task.task == match.target
                );
                const taskShortInfo = await this.createShortInfo(taskData);
                return {
                    task: taskShortInfo,
                    percent: Math.round(match.rating * 100)
                };
            })
        );

        return { matches };
    }
}
