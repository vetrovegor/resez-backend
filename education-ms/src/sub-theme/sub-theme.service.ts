import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubTheme } from './sub-theme.entity';
import { In, Not, Repository } from 'typeorm';
import { SubThemeDto } from '@subject/dto/subject.dto';

@Injectable()
export class SubThemeService {
    constructor(
        @InjectRepository(SubTheme)
        private readonly subThemeRepository: Repository<SubTheme>
    ) {}

    async getBySubjectTaskId(subjectTaskId: number) {
        return await this.subThemeRepository.find({
            where: { subjectTask: { id: subjectTaskId } },
            order: { id: 'ASC' }
        });
    }

    async update(newSubThemes: SubThemeDto[], subjectTaskId: number) {
        const subThemeIds: number[] = [];

        for (const subTheme of newSubThemes) {
            subTheme['subjectTask'] = { id: subjectTaskId };

            await this.subThemeRepository.save(subTheme);

            subThemeIds.push(subTheme.id);
        }

        await this.subThemeRepository.delete({
            subjectTask: { id: subjectTaskId },
            id: Not(In(subThemeIds))
        });
    }
}
