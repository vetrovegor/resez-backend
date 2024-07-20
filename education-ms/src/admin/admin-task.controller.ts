import { CurrentUser } from '@auth/current-user.decorator';
import { JwtPayload, Permissions } from '@auth/interfaces';
import { Permission } from '@auth/permission.decorator';
import { PermissionGuard } from '@auth/permission.guard';
import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    ParseIntPipe,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import { TaskDto } from '@task/dto/task.dto';
import { TaskService } from '@task/task.service';

@Controller('admin/task')
export class AdminTaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post()
    @Permission(Permissions.CreateTasks)
    @UseGuards(PermissionGuard)
    async create(@Body() dto: TaskDto, @CurrentUser() user: JwtPayload) {
        return await this.taskService.create(dto, user.id);
    }

    @Get()
    @Permission(Permissions.Tasks)
    @UseGuards(PermissionGuard)
    async find(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
        @Query('subjectId', new ParseIntPipe({ optional: true }))
        subjectId: number,
        @Query('subjectTaskId', new ParseIntPipe({ optional: true }))
        subjectTaskId: number,
        @Query('subThemeId', new ParseIntPipe({ optional: true }))
        subThemeId: number,
        @Query('userId', new ParseIntPipe({ optional: true })) userId: number
    ) {
        return await this.taskService.find(
            limit,
            offset,
            subjectId,
            subjectTaskId,
            subThemeId,
            userId
        );
    }
}
