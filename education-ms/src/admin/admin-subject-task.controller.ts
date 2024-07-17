import { Permissions } from '@auth/interfaces';
import { Permission } from '@auth/permission.decorator';
import { PermissionGuard } from '@auth/permission.guard';
import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    UseGuards
} from '@nestjs/common';
import { SubjectTaskService } from '@subject-task/subject-task.service';

@Controller('admin/subject-task')
export class AdminSubjectTaskController {
    constructor(private readonly subjectTaskService: SubjectTaskService) {}

    @Get(':id/sub-theme')
    @Permission(Permissions.Subjects)
    @UseGuards(PermissionGuard)
    async getSubjectTasksById(@Param('id', ParseIntPipe) id: number) {
        return await this.subjectTaskService.getSubThemesById(id);
    }
}
