import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubjectTask } from './subject-task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubjectTaskService {
    constructor(
        @InjectRepository(SubjectTask)
        private readonly subjectTaskRepository: Repository<SubjectTask>
    ) {}

    async getTotalPrimaryScoreBySubjectId(subjectId: number) {
        const result = await this.subjectTaskRepository.sum('primaryScore', {
            subject: { id: subjectId }
        });

        return result || 0;
    }
}
