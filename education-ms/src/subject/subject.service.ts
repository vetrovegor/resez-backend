import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './subject.entity';
import { Not, Repository } from 'typeorm';
import { SubjectDto } from './dto/subject.dto';
import { ScoreConversionService } from '@score-conversion/score-conversion.service';
import { SubjectTaskService } from '@subject-task/subject-task.service';
import { SubjectFullInfo } from './dto/subject-full-info.dto';
import { TaskService } from '@task/task.service';

@Injectable()
export class SubjectService {
    constructor(
        @InjectRepository(Subject)
        private readonly subjectRepository: Repository<Subject>,
        @Inject(forwardRef(() => ScoreConversionService))
        private readonly scoreConversionService: ScoreConversionService,
        private readonly subjectTaskService: SubjectTaskService,
        @Inject(forwardRef(() => TaskService))
        private readonly taskService: TaskService
    ) {}

    // попробовать сделать с помощью одного запроса через queryBuilder
    async getById(id: number) {
        const subjectData = (await this.subjectRepository.findOne({
            where: { id },
            relations: ['subjectTasks', 'subjectTasks.subThemes'],
            order: {
                subjectTasks: { number: 'ASC', subThemes: { id: 'ASC' } }
            }
        })) as SubjectFullInfo;

        if (!subjectData) {
            throw new NotFoundException('Предмет не найден');
        }

        subjectData.subjectTasks = await Promise.all(
            subjectData.subjectTasks.map(async subjectTask => {
                let totalTasksCount = 0;

                subjectTask.subThemes = await Promise.all(
                    subjectTask.subThemes.map(async subTheme => {
                        const tasksCount =
                            await this.taskService.getVerifiedTasksCountBySubThemeId(
                                subTheme.id
                            );

                        totalTasksCount += tasksCount;

                        return {
                            ...subTheme,
                            tasksCount
                        };
                    })
                );

                return {
                    ...subjectTask,
                    tasksCount: totalTasksCount
                };
            })
        );

        return subjectData as SubjectFullInfo;
    }

    async create(dto: SubjectDto) {
        const existingSubject = await this.subjectRepository.findOne({
            where: { slug: dto.slug }
        });

        if (existingSubject) {
            throw new BadRequestException(
                `Предмет с таким ярлыком уже существует${existingSubject.isArchived ? ' (в архиве)' : ''}`
            );
        }

        const createdSubject = this.subjectRepository.create({
            ...dto
        });

        const savedSubject = await this.subjectRepository.save(createdSubject);

        return { subject: savedSubject };
    }

    async find(take: number, skip: number, isArchived: boolean) {
        const where = { isArchived };

        const subjectsData = await this.subjectRepository.find({
            where,
            order: { order: 'ASC', createdAt: 'DESC' },
            take,
            skip,
            relations: ['subjectTasks']
        });

        const subjects = await Promise.all(
            subjectsData.map(
                async subject => await this.createShortInfo(subject)
            )
        );

        const totalCount = await this.subjectRepository.count({ where });

        return {
            subjects,
            totalCount,
            isLast: totalCount <= take + skip,
            elementsCount: subjects.length
        };
    }

    async createShortInfo(subjectData: Subject) {
        const { id, subject, slug, isPublished } = subjectData;

        const tasksCount =
            await this.taskService.getVerifiedTasksCountBySubjectId(id);

        return {
            id,
            subject,
            slug,
            isPublished,
            subjectTasksCount: subjectData.subjectTasks.length,
            tasksCount
        };
    }

    async delete(id: number) {
        const existingSubject = await this.getById(id);

        const subject = await this.createShortInfo(existingSubject);

        await this.subjectRepository.remove(existingSubject);

        return { subject };
    }

    async update(id: number, dto: SubjectDto) {
        const existingSubject = await this.getById(id);

        const occupiedSubject = await this.subjectRepository.findOne({
            where: { slug: dto.slug, id: Not(id) }
        });

        if (occupiedSubject) {
            throw new BadRequestException(
                `Предмет с таким ярлыком уже существует${occupiedSubject.isArchived ? ' (в архиве)' : ''}`
            );
        }

        for (const { id: subjectTaskId, subThemes } of dto.subjectTasks) {
            if (!subjectTaskId) continue;

            const existingSubjectTask = existingSubject.subjectTasks.find(
                subjectTask => subjectTask.id == subjectTaskId
            );

            if (!existingSubjectTask) {
                throw new BadRequestException(
                    'Некорректное id задания предмета'
                );
            }

            for (const { id: subThemeId } of subThemes) {
                if (!subThemeId) continue;

                const existingSubTheme = existingSubjectTask.subThemes.find(
                    item => item.id == subThemeId
                );

                if (!existingSubTheme) {
                    throw new BadRequestException('Некорректное id подтемы');
                }
            }
        }

        if (existingSubject.isMark != dto.isMark) {
            await this.scoreConversionService.getBySubjectId(id);
        }

        const { subjectTasks, ...subjectInfo } = dto;

        await this.subjectRepository.save({ id, ...subjectInfo });

        await this.subjectTaskService.update(subjectTasks, id);

        return { subject: existingSubject };
    }

    async toggleIsPublished(id: number) {
        const existingSubject = await this.getById(id);

        const isPublished = !existingSubject.isPublished;

        await this.subjectRepository.update(id, {
            isPublished
        });

        const subject = await this.createShortInfo(existingSubject);

        return { subject: { ...subject, isPublished } };
    }

    async getFullInfoById(id: number) {
        const subject = await this.getById(id);

        return { subject };
    }

    async getBySlug(slug: string) {
        const existingSubject = await this.subjectRepository.findOne({
            where: { slug, isArchived: false, isPublished: true },
            relations: ['subjectTasks', 'subjectTasks.subThemes']
        });

        if (!existingSubject) {
            throw new NotFoundException('Предмет не найден');
        }

        return existingSubject;
    }

    async toggleIsArchived(id: number, isArchived: boolean) {
        const existingSubject = await this.getById(id);

        await this.subjectRepository.update(id, { isArchived });

        const subject = await this.createShortInfo(existingSubject);

        return { subject: { ...subject, isArchived } };
    }

    async getPublished() {
        const subjectsData = await this.subjectRepository.find({
            where: { isPublished: true, isArchived: false },
            order: { createdAt: 'DESC' }
        });

        const subjects = subjectsData.map(({ id, subject, slug }) => ({
            id,
            subject,
            slug
        }));

        return { subjects };
    }

    async getScoreConversionById(id: number) {
        const existingSubject = await this.getById(id);

        const scoreConversion =
            await this.scoreConversionService.getBySubjectId(id);

        return { isMark: existingSubject.isMark, scoreConversion };
    }

    async getScoreInfo(slug: string) {
        const existingSubject = await this.getBySlug(slug);

        if (!existingSubject.isPublished) {
            throw new NotFoundException('Предмет не найден');
        }

        const scoreConversion =
            await this.scoreConversionService.getBySubjectId(
                existingSubject.id
            );

        const subjectTasksData = await this.subjectTaskService.getBySubjectId(
            existingSubject.id
        );

        const subjectTasks = subjectTasksData.map(
            ({ id, number, primaryScore }) => ({ id, number, primaryScore })
        );

        return {
            durationMinutes: existingSubject.durationMinutes,
            isMark: existingSubject.isMark,
            scoreConversion,
            subjectTasks
        };
    }

    async getSubjectTasksById(id: number) {
        await this.getById(id);

        const subjectTasks = await this.subjectTaskService.getBySubjectId(id);

        return { subjectTasks };
    }

    async getTaskInfoById(id: number) {
        const { subjectTasks } = await this.getById(id);
        return { subjectTasks };
    }

    async getTaskInfoBySlug(slug: string) {
        const { id } = await this.getBySlug(slug);
        return this.getTaskInfoById(id);
    }
}
