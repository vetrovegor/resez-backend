import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TaskService } from './task.service';
import { Public } from '@auth/decorators/public.decorator';

@Public()
@Controller('task')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Get(':id')
    async getFullInfo(@Param('id', ParseIntPipe) id: number) {
        return await this.taskService.getFullInfo(id, true);
    }
}
