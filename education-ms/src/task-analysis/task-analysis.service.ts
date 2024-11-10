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

@Injectable()
export class TaskAnalysisService {
    constructor(
        @InjectRepository(TaskAnalysis)
        private readonly taskAnalysisRepository: Repository<TaskAnalysis>,
        private readonly subjectTaskService: SubjectTaskService
    ) {}

    async getById(id: number) {
        const taskAnalysis = await this.taskAnalysisRepository.findOne({
            where: { id },
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
                'Разбор для этого задания уже создан'
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

    // TODO: сделать для админа
    async find(take: number, skip: number, isPublished?: boolean) {
        const where = {
            ...(isPublished != undefined && {
                isPublished
            })
        };

        const tasksAnalysis = await this.taskAnalysisRepository.find({
            where,
            order: { createdAt: 'DESC' },
            take,
            skip
        });

        const totalCount = await this.taskAnalysisRepository.count({ where });

        return {
            tasksAnalysis,
            totalCount,
            isLast: totalCount <= take + skip,
            elementsCount: tasksAnalysis.length
        };
    }

    async findById(id: number) {
        const taskAnalysis = await this.getById(id);

        return taskAnalysis;
    }

    async findBySubjectId(subjectId: number) {
        const tasksAnalysisData = await this.taskAnalysisRepository.find({
            where: {
                isPublished: true,
                subject: { id: subjectId }
            },
            relations: ['subjectTask']
        });

        const tasksAnalysis = tasksAnalysisData.map(({ id, subjectTask }) => ({
            id,
            number: subjectTask.number
        }));

        return { tasksAnalysis };
    }

    async toggleIsPublished(id: number) {
        const taskAnalysis = await this.getById(id);

        const isPublished = !taskAnalysis.isPublished;

        await this.taskAnalysisRepository.update(id, {
            isPublished
        });

        return { taskAnalysis: { ...taskAnalysis, isPublished } };
    }
}
