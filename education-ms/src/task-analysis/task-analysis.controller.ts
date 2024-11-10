import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
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

    @Get(':id')
    async findById(@Param('id', ParseIntPipe) id: number) {
        return await this.taskAnalysisService.findById(id);
    }
}
