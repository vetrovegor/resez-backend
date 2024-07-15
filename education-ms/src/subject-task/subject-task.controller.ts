import { Controller } from '@nestjs/common';
import { SubjectTaskService } from './subject-task.service';

@Controller('subject-task')
export class SubjectTaskController {
    constructor(private readonly subjectTaskService: SubjectTaskService) {}
}
