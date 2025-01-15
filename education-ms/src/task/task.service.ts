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
import { SnippetService } from '@snippet/snippet.service';
import { SourceService } from '@source/source.service';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @Inject(forwardRef(() => SubjectService))
        private readonly subjectService: SubjectService,
        private readonly logService: LogService,
        private readonly userService: UserService,
        private readonly snippetService: SnippetService,
        private readonly sourceService: SourceService
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

        const snippets =
            await this.snippetService.extractAndValidateSnippetsFromHtml(
                dto.task + dto.solution
            );

        if (dto.sourceId) {
            await this.sourceService.getById(dto.sourceId);
        }

        const hasVerifiedPermission = user.permissions.some(
            permission => permission.permission == Permissions.VerifyTasks
        );

        const savedTask = await this.taskRepository.save({
            ...dto,
            isVerified: hasVerifiedPermission ? dto.isVerified : false,
            subject: { id: dto.subjectId },
            subjectTask: { id: dto.subjectTaskId },
            subTheme: { id: dto.subThemeId },
            userId: user.id,
            snippets,
            sourceRelation: { id: dto.sourceId }
        });

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

    async createShortInfo(taskData: Task) {
        const task = this.snippetService.addSnippetsContentToHtml(
            taskData.task,
            taskData.snippets
        );
        const solution = taskData.solution
            ? this.snippetService.addSnippetsContentToHtml(
                  taskData.solution,
                  taskData.snippets
              )
            : null;
        const { subject = null } = taskData.subject || {};
        const { number = null, theme = null } = taskData.subjectTask || {};
        const { subTheme = null } = taskData.subTheme || {};
        const user = await this.userService.getById(taskData.userId);
        const tests = taskData.tests.map(({ id, subject }) => ({
            id,
            subject: subject.subject
        }));

        delete taskData.solution;
        delete taskData.answers;
        delete taskData.subjectTask;
        delete taskData.userId;
        delete taskData.comments;
        delete taskData.snippets;

        return {
            ...taskData,
            task,
            solution,
            number,
            subject,
            theme,
            subTheme,
            user,
            testsCount: tests.length,
            tests
        };
    }

    async find({
        limit,
        offset,
        isArchived,
        subjectId,
        subjectTaskId,
        subThemeId,
        userId,
        isVerified,
        currentTaskId
    }: {
        limit: number;
        offset: number;
        isArchived: boolean;
        subjectId?: number;
        subjectTaskId?: number;
        subThemeId?: number;
        userId?: number;
        isVerified?: boolean;
        currentTaskId?: number;
    }) {
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
            }),
            ...(currentTaskId && { id: Not(currentTaskId) })
        };

        const order = { [isArchived ? 'updatedAt' : 'createdAt']: 'DESC' };

        let current = null;

        if (currentTaskId) {
            const currentTaskData = await this.taskRepository.findOne({
                where: { id: currentTaskId },
                relations: [
                    'subject',
                    'subjectTask',
                    'subTheme',
                    'tests',
                    'tests.subject',
                    'snippets',
                    'sourceRelation'
                ]
            });

            if (!currentTaskData) {
                throw new NotFoundException('Задание не найдено');
            }

            current = await this.createShortInfo(currentTaskData);
        }

        const [tasksData, totalCount] = await this.taskRepository.findAndCount({
            where,
            order,
            take: limit,
            skip: offset,
            relations: [
                'subject',
                'subjectTask',
                'subTheme',
                'tests',
                'tests.subject',
                'snippets',
                'sourceRelation'
            ]
        });

        const tasks = await Promise.all(
            tasksData.map(async task => await this.createShortInfo(task))
        );

        return {
            ...(current && { current }),
            tasks,
            totalCount,
            isLast: totalCount <= limit + offset,
            elementsCount: tasksData.length
        };
    }

    async findBySubThemeId(subThemeId: number, take: number, skip: number) {
        const where = {
            isVerified: true,
            isArchived: false,
            subTheme: { id: subThemeId }
        };

        const [tasksData, totalCount] = await this.taskRepository.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            take,
            skip,
            relations: [
                'subject',
                'subjectTask',
                'subTheme',
                'comments',
                'snippets',
                'sourceRelation'
            ]
        });

        const tasks = tasksData.map(task => {
            task['commentsCount'] = task.comments.length;
            task.task = this.snippetService.addSnippetsContentToHtml(
                task.task,
                task.snippets
            );
            task.solution = this.snippetService.addSnippetsContentToHtml(
                task.solution,
                task.snippets
            );

            delete task.comments;

            return task;
        });

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
            relations: [
                'subject',
                'subjectTask',
                'subTheme',
                'comments',
                'snippets',
                'sourceRelation'
            ]
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
        task['commentsCount'] = task.comments.length;
        task['user'] = await this.userService.getById(task.userId);
        task.task = this.snippetService.addSnippetsContentToHtml(
            task.task,
            task.snippets
        );
        task.solution = this.snippetService.addSnippetsContentToHtml(
            task.solution,
            task.snippets
        );

        delete task.userId;
        delete task.comments;

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

        if (oldFullInfo.isArchived && dto.isVerified) {
            throw new BadRequestException(
                'Нельзя верифицировать архивное задание'
            );
        }

        const snippets =
            await this.snippetService.extractAndValidateSnippetsFromHtml(
                dto.task + dto.solution
            );

        await this.sourceService.getById(dto.sourceId);

        const hasVerifiedPermission = user.permissions.some(
            permission => permission.permission == Permissions.VerifyTasks
        );

        const savedTask = await this.taskRepository.save({
            id,
            ...dto,
            isVerified: hasVerifiedPermission ? dto.isVerified : false,
            subject: { id: dto.subjectId },
            subjectTask: { id: dto.subjectTaskId },
            subTheme: { id: dto.subThemeId },
            snippets,
            sourceRelation: { id: dto.sourceId }
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

        if (task.isArchived) {
            throw new BadRequestException(
                'Нельзя верифицировать архивное задание'
            );
        }

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
            .createQueryBuilder('t')
            .leftJoinAndSelect('tests_tasks_tasks', 'ttt', 'ttt.tasksId = t.id')
            .where('t.subject_task_id = :subjectTaskId', {
                subjectTaskId
            })
            .groupBy('t.id')
            .orderBy('COUNT(ttt.testsId)')
            .select(['t.id'])
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
            relations: [
                'subject',
                'subjectTask',
                'subTheme',
                'tests',
                'tests.subject',
                'snippets'
            ]
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
