import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubjectTask } from './subject-task.entity';
import { In, Not, Repository } from 'typeorm';
import { SubThemeService } from '@sub-theme/sub-theme.service';
import { SubjectTaskDto } from '@subject/dto/subject.dto';
import { TaskService } from '@task/task.service';

@Injectable()
export class SubjectTaskService {
    constructor(
        @InjectRepository(SubjectTask)
        private readonly subjectTaskRepository: Repository<SubjectTask>,
        private readonly subThemeService: SubThemeService,
        private readonly taskService: TaskService
    ) {}

    async getTotalPrimaryScoreBySubjectId(subjectId: number) {
        const result = await this.subjectTaskRepository.sum('primaryScore', {
            subject: { id: subjectId }
        });

        return result || 0;
    }

    async getBySubjectId(subjectId: number) {
        return await this.subjectTaskRepository.find({
            where: { subject: { id: subjectId } },
            order: { number: 'ASC' }
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

    async update(newSubjectTasks: SubjectTaskDto[], subjectId: number) {
        const subjectTaskIds: number[] = [];

        for (const subjectTask of newSubjectTasks) {
            const { id } = subjectTask;
            subjectTask['subject'] = { id: subjectId };
            const { subThemes, ...subjectTaskInfo } = subjectTask;
            let subjectTaskId = null;

            if (!id) {
                const createdSubjectTask =
                    this.subjectTaskRepository.create(subjectTask);

                const savedSubjectTask =
                    await this.subjectTaskRepository.save(createdSubjectTask);

                subjectTaskId = savedSubjectTask.id;
            } else {
                await this.subjectTaskRepository.save(subjectTaskInfo);

                subjectTaskId = id;

                await this.subThemeService.update(subThemes, subjectTaskId);
            }

            subjectTaskIds.push(subjectTaskId);
        }

        await this.taskService.archiveTasksBySubjectTasksIds(
            subjectId,
            subjectTaskIds
        );

        await this.subjectTaskRepository.delete({
            subject: { id: subjectId },
            id: Not(In(subjectTaskIds))
        });
    }
}
