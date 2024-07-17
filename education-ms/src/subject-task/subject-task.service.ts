import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubjectTask } from './subject-task.entity';
import { Repository } from 'typeorm';
import { SubThemeService } from '@sub-theme/sub-theme.service';

@Injectable()
export class SubjectTaskService {
    constructor(
        @InjectRepository(SubjectTask)
        private readonly subjectTaskRepository: Repository<SubjectTask>,
        private readonly subThemeService: SubThemeService
    ) {}

    async getTotalPrimaryScoreBySubjectId(subjectId: number) {
        const result = await this.subjectTaskRepository.sum('primaryScore', {
            subject: { id: subjectId }
        });

        return result || 0;
    }

    async getBySubjectId(subjectId: number) {
        return await this.subjectTaskRepository.find({
            where: { subject: { id: subjectId } }
        });
    }

    async getSubThemesById(id: number) {
        const subjectTask = await this.subjectTaskRepository.findOne({
            where: { id }
        });

        if (!subjectTask) {
            throw new NotFoundException('Задание предмета не найдено');
        }

        const subThemes = await this.subThemeService.getBySubjectTaskId(id);

        return { subThemes };
    }
}
