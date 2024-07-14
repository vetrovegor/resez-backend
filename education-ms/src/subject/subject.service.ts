import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './subject.entity';
import { Repository } from 'typeorm';
import { SubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectService {
    constructor(
        @InjectRepository(Subject)
        private readonly subjectRepository: Repository<Subject>
    ) {}

    async create(dto: SubjectDto) {
        const existingSubject = await this.subjectRepository.findOne({
            where: { slug: dto.slug }
        });

        if (existingSubject) {
            throw new BadRequestException(
                'Предмет с таким ярлыком уже существует'
            );
        }

        // вынести в мидлвейр
        for (let i = 0; i < dto.subjectTasks.length; i++) {
            dto.subjectTasks[i].number = i + 1;
        }

        const createdSubject = this.subjectRepository.create({
            ...dto
        });

        const savedSubject = await this.subjectRepository.save(createdSubject);

        return await this.createShortInfo(savedSubject);
    }

    async createShortInfo(subjectData: Subject) {
        const { id, subject, slug, isPublished } = subjectData;

        // subjectTasksCount
        // tasksCount

        return {
            id,
            subject,
            slug,
            isPublished
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
}
