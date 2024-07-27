import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Query
} from '@nestjs/common';
import { SubThemeService } from './sub-theme.service';
import { Public } from '@auth/public.decorator';
import { TaskService } from '@task/task.service';

@Public()
@Controller('sub-theme')
export class SubThemeController {
    constructor(
        private readonly subThemeService: SubThemeService,
        private readonly taskService: TaskService
    ) {}

    @Get(':id/task')
    async getTasksBySubthemeId(
        @Param('id', ParseIntPipe) id: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number
    ) {
        return await this.taskService.find(
            limit,
            offset,
            false,
            null,
            null,
            id,
            null,
            true
        );
    }
}
