import { Permissions } from '@auth/interfaces';
import { Permission } from '@auth/permission.decorator';
import { PermissionGuard } from '@auth/permission.guard';
import {
    Body,
    Controller,
    Delete,
    Param,
    ParseIntPipe,
    Post,
    UseGuards
} from '@nestjs/common';
import { SubjectDto } from '@subject/dto/subject.dto';
import { SubjectService } from '@subject/subject.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly subjectService: SubjectService) {}

    @Post('/subject')
    @Permission(Permissions.CreateSubjects)
    @UseGuards(PermissionGuard)
    async create(@Body() dto: SubjectDto) {
        return await this.subjectService.create(dto);
    }

    @Delete('/subject/:id')
    @Permission(Permissions.DeleteSubjects)
    @UseGuards(PermissionGuard)
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.subjectService.delete(id);
    }
}
