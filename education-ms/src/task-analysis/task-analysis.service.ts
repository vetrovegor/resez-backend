import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskAnalysis } from './task-analysis.entity';
import { Repository } from 'typeorm';
import { TaskAnalysisDto } from './dto/task-analysis.dto';
import { SubjectTaskService } from '@subject-task/subject-task.service';
import { UserService } from '@user/user.service';

@Injectable()
export class TaskAnalysisService {
    constructor(
        @InjectRepository(TaskAnalysis)
        private readonly taskAnalysisRepository: Repository<TaskAnalysis>,
        private readonly subjectTaskService: SubjectTaskService,
        private readonly userService: UserService
    ) {}

    async getById(id: number, isPublished?: boolean) {
        const where = {
            id,
            ...(isPublished != undefined && {
                isPublished
            })
        };

        const taskAnalysis = await this.taskAnalysisRepository.findOne({
            where,
            relations: ['subject', 'subjectTask']
        });

        if (!taskAnalysis) {
            throw new NotFoundException('Разбор задания не найден');
        }

        return taskAnalysis;
    }

    async create({ subjectTaskId, content }: TaskAnalysisDto, userId: number) {
        const existingTaskAnalysis = await this.taskAnalysisRepository.findOne({
            where: { subjectTask: { id: subjectTaskId } }
        });

        if (existingTaskAnalysis) {
            throw new BadRequestException(
                `Разбор для этого задания уже создан${existingTaskAnalysis.isArchived ? ' (в архиве)' : ''}`
            );
        }

        const subjectTask =
            await this.subjectTaskService.getById(subjectTaskId);

        return this.taskAnalysisRepository.save({
            content,
            subject: subjectTask.subject,
            subjectTask,
            userId
        });
    }

    async findBasicInfoById(id: number) {
        const taskAnalysis = await this.getById(id, true);

        delete taskAnalysis.isPublished;
        delete taskAnalysis.userId;
        delete taskAnalysis.createdAt;
        delete taskAnalysis.updatedAt;

        return taskAnalysis;
    }

    async findFullInfoById(id: number) {
        const taskAnalysis = await this.getById(id);

        taskAnalysis['user'] = await this.userService.getById(
            taskAnalysis.userId
        );

        delete taskAnalysis.userId;

        return taskAnalysis;
    }

    async update(id: number, { subjectTaskId, content }: TaskAnalysisDto) {
        const taskAnalysis = await this.getById(id);

        if (taskAnalysis.subjectTask.id != subjectTaskId) {
            const existingTaskAnalysis =
                await this.taskAnalysisRepository.findOne({
                    where: { subjectTask: { id: subjectTaskId } }
                });

            if (existingTaskAnalysis) {
                throw new BadRequestException(
                    `Разбор для этого задания уже создан${existingTaskAnalysis.isArchived ? ' (в архиве)' : ''}`
                );
            }
        }

        const subjectTask =
            await this.subjectTaskService.getById(subjectTaskId);

        return this.taskAnalysisRepository.save({
            id,
            content,
            subject: subjectTask.subject,
            subjectTask
        });
    }

    async findBySubjectId(subjectId: number) {
        const tasksAnalysisData = await this.taskAnalysisRepository.find({
            where: {
                isPublished: true,
                subject: { id: subjectId }
            },
            relations: ['subjectTask'],
            order: { subjectTask: { number: 'ASC' } }
        });

        const tasksAnalysis = tasksAnalysisData.map(({ id, subjectTask }) => ({
            id,
            number: subjectTask.number
        }));

        return { tasksAnalysis };
    }

    async find(take: number, skip: number, isArchived: boolean) {
        const where = { isArchived };

        const [tasksAnalysisData, totalCount] =
            await this.taskAnalysisRepository.findAndCount({
                where,
                order: { createdAt: 'DESC', subjectTask: { number: 'ASC' } },
                relations: ['subject', 'subjectTask'],
                take,
                skip
            });

        const tasksAnalysis = await Promise.all(
            tasksAnalysisData.map(async item => {
                const user = await this.userService.getById(item.userId);

                delete item.userId;

                return {
                    ...item,
                    user
                };
            })
        );

        return {
            tasksAnalysis,
            totalCount,
            isLast: totalCount <= take + skip,
            elementsCount: tasksAnalysis.length
        };
    }

    async toggleIsPublished(id: number) {
        const taskAnalysis = await this.getById(id);

        const isPublished = !taskAnalysis.isPublished;

        await this.taskAnalysisRepository.update(id, {
            isPublished
        });

        return { taskAnalysis: { ...taskAnalysis, isPublished } };
    }

    async toggleIsArchived(id: number, isArchived: boolean) {
        await this.getById(id);

        await this.taskAnalysisRepository.update(id, {
            isArchived,
            isPublished: false
        });
    }
}
