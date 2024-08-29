import { Controller } from '@nestjs/common';
import { SubjectTaskService } from './subject-task.service';
import { Public } from '@auth/decorators/public.decorator';

@Public()
@Controller('subject-task')
export class SubjectTaskController {
    constructor(private readonly subjectTaskService: SubjectTaskService) {}
}
