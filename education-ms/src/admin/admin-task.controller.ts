import { Permissions } from '@auth/interfaces';
import { Permission } from '@auth/permission.decorator';
import { PermissionGuard } from '@auth/permission.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TaskDto } from '@task/dto/task.dto';
import { TaskService } from '@task/task.service';

@Controller('admin/task')
export class AdminTaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post()
    @Permission(Permissions.CreateTasks)
    @UseGuards(PermissionGuard)
    async create(@Body() dto: TaskDto) {
        return await this.taskService.create(dto);
    }
}
