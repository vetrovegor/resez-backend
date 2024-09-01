import { Permissions } from '@auth/interfaces/interfaces';
import { Permission } from '@auth/decorators/permission.decorator';
import { PermissionGuard } from '@auth/guards/permission.guard';
import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    UseGuards
} from '@nestjs/common';
import { SubjectTaskService } from '@subject-task/subject-task.service';

@Controller('admin/subject-task')
export class SubjectTaskController {
    constructor(private readonly subjectTaskService: SubjectTaskService) {}

    @Get(':id/sub-theme')
    @Permission(Permissions.Education)
    @UseGuards(PermissionGuard)
    async getSubjectTasksById(@Param('id', ParseIntPipe) id: number) {
        return await this.subjectTaskService.getSubThemesById(id);
    }
}
