import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JSDOM } from 'jsdom';
import { Snippet } from './snippet.entity';
import { Repository } from 'typeorm';
import { SnippetDto } from './dto/snippet.dto';
import { SubjectService } from '@subject/subject.service';
import { UserService } from '@user/user.service';

@Injectable()
export class SnippetService {
    constructor(
        @InjectRepository(Snippet)
        private readonly snippetRepository: Repository<Snippet>,
        @Inject(forwardRef(() => SubjectService))
        private readonly subjectService: SubjectService,
        private readonly userService: UserService
    ) {}

    async createDto(snippet: Snippet) {
        const user = await this.userService.getById(snippet.userId);

        delete snippet.userId;

        return {
            ...snippet,
            subject: snippet.subject.subject,
            user
        };
    }

    async getById(id: number) {
        const snippet = await this.snippetRepository.findOne({
            where: { id },
            relations: ['subject', 'tasks']
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

    async findById(id: number) {
        const snippet = await this.getById(id);

        const user = await this.userService.getById(snippet.userId);

        delete snippet.userId;

        return {
            ...snippet,
            user
        };
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

        const snippetsData = await this.snippetRepository.find({
            where,
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
            relations: ['subject']
        });

        const snippets = await Promise.all(
            snippetsData.map(snippet => this.createDto(snippet))
        );

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

        return await this.createDto(snippet);
    }

    async delete(id: number) {
        const snippet = await this.getById(id);

        if (snippet.tasks.length > 0) {
            throw new BadRequestException('Вставка используется в заданиях');
        }

        await this.snippetRepository.remove(snippet);

        return await this.createDto(snippet);
    }

    async extractAndValidateSnippetsFromHtml(html: string) {
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const elements = document.querySelectorAll('.snippet');

        const snippetIds = Array.from(elements).map(snippet =>
            Number(snippet.id)
        );

        return await Promise.all(
            snippetIds.map(async snippetId => await this.getById(snippetId))
        );
    }

    addSnippetsContentToHtml(html: string, snippets: Snippet[]) {
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const elements = document.querySelectorAll('.snippet');

        for (const element of Array.from(elements)) {
            const { content } = snippets.find(
                snippet => (snippet.id = Number(element.id))
            );

            element.innerHTML = content;
        }

        return dom.window.document.body.innerHTML;
    }

    removeSnippetsFromHtml(html: string) {
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const elements = document.querySelectorAll('.snippet');

        elements.forEach(element => {
            element.remove();
        });

        return dom.window.document.body.innerHTML;
    }
}
