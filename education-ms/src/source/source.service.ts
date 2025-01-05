import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Source } from './source.entity';
import { Not, Repository } from 'typeorm';
import { SourceRequestDto } from './dto/source-request.dto';

@Injectable()
export class SourceService {
    constructor(
        @InjectRepository(Source)
        private readonly sourceRepository: Repository<Source>
    ) {}

    async getById(id: number) {
        const source = await this.sourceRepository.findOne({
            where: { id },
            relations: ['tasks']
        });

        if (!source) {
            throw new NotFoundException('Источник не найден');
        }

        return source;
    }

    async create({ source, slug }: SourceRequestDto) {
        const existingSource = await this.sourceRepository.findOne({
            where: { slug }
        });

        if (existingSource) {
            throw new BadRequestException(
                'Источник с таким ярылком уже существует'
            );
        }

        const savedSource = await this.sourceRepository.save({
            source,
            slug
        });

        return { source: savedSource };
    }

    async find() {
        const sources = await this.sourceRepository.find();

        return { sources };
    }

    async update(id: number, { source, slug }: SourceRequestDto) {
        await this.getById(id);

        const occupiedSource = await this.sourceRepository.findOne({
            where: { slug, id: Not(id) }
        });

        if (occupiedSource) {
            throw new BadRequestException(
                'Источник с таким ярлыком уже существует'
            );
        }

        const savedSource = await this.sourceRepository.save({
            id,
            source,
            slug
        });

        return { source: savedSource };
    }

    async delete(id: number) {
        const existingSource = await this.getById(id);

        await this.sourceRepository.remove(existingSource);

        return { source: existingSource };
    }
}
