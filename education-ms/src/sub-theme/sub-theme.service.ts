import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubTheme } from './sub-theme.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubThemeService {
    constructor(
        @InjectRepository(SubTheme)
        private readonly subThemeRepository: Repository<SubTheme>
    ) {}

    async getBySubjectTaskId(subjectTaskId: number) {
        return await this.subThemeRepository.find({
            where: { subjectTask: { id: subjectTaskId } }
        });
    }
}
