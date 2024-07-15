import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './subject.entity';
import { Not, Repository } from 'typeorm';
import { SubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectService {
    constructor(
        @InjectRepository(Subject)
        private readonly subjectRepository: Repository<Subject>
    ) {}

    // использовать где нужно
    async getById(id: number) {
        const existingSubject = await this.subjectRepository.findOne({
            where: { id }
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
                'Предмет с таким ярлыком уже существует'
            );
        }

        // в мидлвейр
        for (let i = 0; i < dto.subjectTasks.length; i++) {
            dto.subjectTasks[i].number = i + 1;
        }

        const createdSubject = this.subjectRepository.create({
            ...dto
        });

        const savedSubject = await this.subjectRepository.save(createdSubject);

        return await this.createShortInfo(savedSubject);
    }

    async find(take: number, skip: number) {
        const where = { isArchived: false };

        const subjectsData = await this.subjectRepository.find({
            where,
            order: { createdAt: 'DESC' },
            take,
            skip
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
            subjectTasksCount: 95,
            tasksCount: 123
        };
    }

    async delete(id: number) {
        const existingSubject = await this.subjectRepository.findOne({
            where: { id }
        });

        const shortInfo = await this.createShortInfo(existingSubject);

        if (!existingSubject) {
            throw new NotFoundException('Предмет не найден');
        }

        await this.subjectRepository.remove(existingSubject);

        return shortInfo;
    }

    // довести до ума чтобы обновлялись корректно задания, подтемы
    // удалялись задания, у которых subjectId стал null
    async update(id: number, dto: SubjectDto) {
        const existingSubject = await this.subjectRepository.findOne({
            where: { id },
            relations: ['subjectTasks', 'subjectTasks.subThemes']
        });

        if (!existingSubject) {
            throw new NotFoundException('Предмет не найден');
        }

        const occupiedSubject = await this.subjectRepository.findOne({
            where: { slug: dto.slug, id: Not(id) }
        });

        if (occupiedSubject) {
            throw new BadRequestException(
                'Предмет с таким ярлыком уже существует'
            );
        }

        if (existingSubject.isMark != dto.isMark) {
            // удалить таблицу баллов
        }

        // в мидлвейр
        for (let i = 0; i < dto.subjectTasks.length; i++) {
            dto.subjectTasks[i].number = i + 1;
        }

        const updatedRecord = Object.assign(existingSubject, {
            ...dto
        });

        const updatedSubject = await this.subjectRepository.save(updatedRecord);

        return await this.createShortInfo(updatedSubject);
    }

    async toggleIsPublished(id: number) {
        const existingSubject = await this.subjectRepository.findOne({
            where: { id }
        });

        if (!existingSubject) {
            throw new NotFoundException('Предмет не найден');
        }

        await this.subjectRepository.update(id, {
            isPublished: !existingSubject.isPublished
        });

        return await this.createShortInfo(existingSubject);
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
        const existingSubject = await this.subjectRepository.findOne({
            where: { id }
        });

        if (!existingSubject) {
            throw new NotFoundException('Предмет не найден');
        }

        await this.subjectRepository.update(id, { isArchived });

        return this.createShortInfo(existingSubject);
    }

    async getPublished() {
        const subjectsData = await this.subjectRepository.find({
            where: { isPublished: true }
        });

        const subjects = subjectsData.map(({ id, subject }) => ({
            id,
            subject
        }));

        return { subjects };
    }
}
