import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { JwtPayload, Permissions } from '@auth/interfaces/interfaces';
import { Permission } from '@auth/decorators/permission.decorator';
import { PermissionGuard } from '@auth/guards/permission.guard';
import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseBoolPipe,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import { MatchDto } from '@task/dto/match.dto';
import { TaskDto } from '@task/dto/task.dto';
import { TaskService } from '@task/task.service';

@Controller('admin/task')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post()
    @Permission(Permissions.CreateTasks)
    @UseGuards(PermissionGuard)
    async create(@Body() dto: TaskDto, @CurrentUser() user: JwtPayload) {
        return await this.taskService.create(dto, user);
    }

    @Get()
    @Permission(Permissions.Tasks)
    @UseGuards(PermissionGuard)
    async find(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
        @Query('subject_id', new ParseIntPipe({ optional: true }))
        subjectId: number,
        @Query('subject_task_id', new ParseIntPipe({ optional: true }))
        subjectTaskId: number,
        @Query('subTheme_id', new ParseIntPipe({ optional: true }))
        subThemeId: number,
        @Query('user_id', new ParseIntPipe({ optional: true })) userId: number,
        @Query('is_verified', new ParseBoolPipe({ optional: true }))
        isVerified: boolean
    ) {
        return await this.taskService.find(
            limit,
            offset,
            false,
            subjectId,
            subjectTaskId,
            subThemeId,
            userId,
            isVerified
        );
    }

    @Get('archived')
    @Permission(Permissions.Archive)
    @UseGuards(PermissionGuard)
    async findArchived(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number
    ) {
        return await this.taskService.find(limit, offset, true);
    }

    @Get(':id')
    @Permission(Permissions.Tasks)
    @UseGuards(PermissionGuard)
    async getFullInfo(@Param('id', ParseIntPipe) id: number) {
        return await this.taskService.getFullInfo(id, false);
    }

    @Patch(':id')
    @Permission(Permissions.UpdateTasks)
    @UseGuards(PermissionGuard)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: TaskDto,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.taskService.update(id, dto, user);
    }

    @Patch(':id/toggle-verify')
    @Permission(Permissions.VerifyTasks)
    @UseGuards(PermissionGuard)
    async toggleIsVerified(@Param('id', ParseIntPipe) id: number) {
        return await this.taskService.toggleIsVerified(id);
    }

    @Delete(':id/archive')
    @Permission(Permissions.DeleteTasks)
    @UseGuards(PermissionGuard)
    async archive(@Param('id', ParseIntPipe) id: number) {
        return await this.taskService.toggleIsArchived(id, true);
    }

    @Patch(':id/restore')
    @Permission(Permissions.DeleteTasks)
    @UseGuards(PermissionGuard)
    async restore(@Param('id', ParseIntPipe) id: number) {
        return await this.taskService.toggleIsArchived(id, false);
    }

    @Delete(':id')
    @Permission(Permissions.DeleteTasks)
    @UseGuards(PermissionGuard)
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.taskService.delete(id);
    }

    @Post('match')
    async findMatches(@Body() dto: MatchDto) {
        return await this.taskService.findMatches(dto);
    }
}
