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

@Injectable()
export class SubjectService {
    constructor(
        @InjectRepository(Subject)
        private readonly subjectRepository: Repository<Subject>,
        @Inject(forwardRef(() => ScoreConversionService))
        private readonly scoreConversionService: ScoreConversionService,
        private readonly subjectTaskService: SubjectTaskService
    ) {}

    // использовать где нужно
    async getById(id: number) {
        const existingSubject = await this.subjectRepository.findOne({
            where: { id },
            relations: ['subjectTasks', 'subjectTasks.subThemes']
        });

        if (!existingSubject) {
            throw new NotFoundException('Предмет не найден');
        }

        return existingSubject;
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

        const subject = await this.createShortInfo(savedSubject);

        return { subject };
    }

    async find(take: number, skip: number, isArchived: boolean) {
        const where = { isArchived };

        const subjectsData = await this.subjectRepository.find({
            where,
            order: { createdAt: 'DESC' },
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

        // subjectTasksCount
        // tasksCount

        return {
            id,
            subject,
            slug,
            isPublished,
            subjectTasksCount: subjectData.subjectTasks.length,
            tasksCount: 123
        };
    }

    async delete(id: number) {
        const existingSubject = await this.getById(id);

        const subject = await this.createShortInfo(existingSubject);

        await this.subjectRepository.remove(existingSubject);

        return { subject };
    }

    // довести до ума чтобы обновлялись корректно задания, подтемы
    // удалялись задания, у которых subjectId стал null
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

        if (existingSubject.isMark != dto.isMark) {
            await this.scoreConversionService.getBySubjectId(id);
        }

        const { subjectTasks, ...subjectInfo } = dto;

        await this.subjectRepository.save({ id, ...subjectInfo });

        await this.subjectTaskService.update(
            existingSubject.subjectTasks,
            subjectTasks,
            id
        );

        const newSubject = await this.getById(id);

        const subject = await this.createShortInfo(newSubject);

        return { subject };
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

        // использовать реальные tasksCount
        subject.subjectTasks.forEach(subjectTask => {
            subjectTask['tasksCount'] = Math.floor(Math.random() * 6);

            subjectTask.subThemes.forEach(subTheme => {
                subTheme['tasksCount'] = Math.floor(Math.random() * 6);
            });
        });

        return { subject };
    }

    async getBySlug(slug: string) {
        const existingSubject = await this.subjectRepository.findOne({
            where: { slug },
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
}
