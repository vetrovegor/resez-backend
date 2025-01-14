import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TaskAnalysisService } from './task-analysis.service';
import { Public } from '@auth/decorators/public.decorator';

@Public()
@Controller('task-analysis')
export class TaskAnalysisController {
    constructor(private readonly taskAnalysisService: TaskAnalysisService) {}

    @Get(':id')
    async findBasicInfoById(@Param('id', ParseIntPipe) id: number) {
        return await this.taskAnalysisService.findBasicInfoById(id);
    }
}
