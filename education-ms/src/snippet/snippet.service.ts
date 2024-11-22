import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Snippet } from './snippet.entity';
import { Repository } from 'typeorm';
import { SnippetDto } from './dto/snippet.dto';
import { SubjectService } from '@subject/subject.service';

@Injectable()
export class SnippetService {
    constructor(
        @InjectRepository(Snippet)
        private readonly snippetRepository: Repository<Snippet>,
        private readonly subjectService: SubjectService
    ) {}

    async getById(id: number) {
        const snippet = await this.snippetRepository.findOne({
            where: { id },
            relations: ['subject']
        });

        if (!snippet) {
            throw new NotFoundException('Вставка не найдена');
        }

        return snippet;
    }

    async create({ subjectId, content, title }: SnippetDto, userId: number) {
        await this.subjectService.getById(subjectId);

        return await this.snippetRepository.save({
            subject: { id: subjectId },
            content,
            title,
            userId
        });
    }

    async find({
        limit,
        offset,
        subjectId
    }: {
        limit: number;
        offset: number;
        subjectId?: number;
    }) {
        const where = {
            ...(subjectId != undefined && {
                subject: { id: subjectId }
            })
        };

        const snippets = await this.snippetRepository.find({
            where,
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
            relations: ['subject']
        });

        const totalCount = await this.snippetRepository.count({ where });

        return {
            snippets,
            totalCount,
            isLast: totalCount <= limit + offset,
            elementsCount: snippets.length
        };
    }

    async update(id: number, { subjectId, content, title }: SnippetDto) {
        const snippet = await this.getById(id);
        await this.subjectService.getById(subjectId);

        await this.snippetRepository.save({
            id,
            subject: { id: subjectId },
            content,
            title
        });

        return snippet;
    }

    async delete(id: number) {
        const snippet = await this.getById(id);

        await this.snippetRepository.remove(snippet);

        return snippet;
    }
}
