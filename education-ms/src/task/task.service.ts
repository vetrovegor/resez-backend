import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { TaskDto } from './dto/task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { SubjectService } from '@subject/subject.service';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @Inject(forwardRef(() => SubjectService))
        private readonly subjectService: SubjectService
    ) {}

    async create(dto: TaskDto) {
        const existingSubject = await this.subjectService.getById(
            dto.subjectId
        );

        const subjectTask = existingSubject.subjectTasks.find(
            subjectTask => subjectTask.id == dto.subjectTaskId
        );

        if (!subjectTask) {
            throw new NotFoundException('Задание предмета не найдено');
        }

        const subTheme = subjectTask.subThemes.find(
            subTheme => subTheme.id == dto.subThemeId
        );

        if (!subTheme) {
            throw new NotFoundException('Подтема не найдена');
        }

        if (subjectTask.isDetailedAnswer && !dto.solution) {
            throw new BadRequestException(
                'Задание с развернутым ответом должно содержать решение'
            );
        }

        if (!subjectTask.isDetailedAnswer && !dto.answer) {
            throw new BadRequestException(
                'Задание без развернутого ответа должно содержать ответ'
            );
        }

        const createdTask = this.taskRepository.create({
            ...dto
        });

        const savedTask = await this.taskRepository.save(createdTask);

        return savedTask;
    }
}
