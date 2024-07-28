import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubTheme } from './sub-theme.entity';
import { In, Not, Repository } from 'typeorm';
import { SubThemeDto } from '@subject/dto/subject.dto';
import { TaskService } from '@task/task.service';

@Injectable()
export class SubThemeService {
    constructor(
        @InjectRepository(SubTheme)
        private readonly subThemeRepository: Repository<SubTheme>,
        private readonly taskService: TaskService
    ) {}

    async getInfoById(id: number) {
        const subTheme = await this.subThemeRepository.findOne({
            where: { id },
            relations: ['subjectTask', 'subjectTask.subject']
        });

        if (!subTheme) {
            throw new NotFoundException('Подтема не найдена');
        }

        const { subject, number, theme } = subTheme.subjectTask;
        delete subTheme.subjectTask;

        return {
            subTheme: {
                subject: subject.subject,
                number,
                theme,
                ...subTheme
            }
        };
    }

    async findTasksBySubthemeId(id: number, take: number, skip: number) {
        await this.getInfoById(id);
        return await this.taskService.findBySubThemeId(id, take, skip);
    }

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
