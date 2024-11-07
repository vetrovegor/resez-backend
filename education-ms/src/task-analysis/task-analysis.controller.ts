import {
    Controller,
    DefaultValuePipe,
    Get,
    ParseIntPipe,
    Query
} from '@nestjs/common';
import { TaskAnalysisService } from './task-analysis.service';

@Controller('task-analysis')
export class TaskAnalysisController {
    constructor(private readonly taskAnalysisService: TaskAnalysisService) {}

    @Get()
    async find(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number
    ) {
        return await this.taskAnalysisService.find(limit, offset, true);
    }
}
