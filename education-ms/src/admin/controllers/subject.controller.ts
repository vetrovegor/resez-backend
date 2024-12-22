import { JwtPayload, Permissions } from '@auth/interfaces/interfaces';
import { Permission } from '@auth/decorators/permission.decorator';
import { PermissionGuard } from '@auth/guards/permission.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { ScoreConversionDto } from '@score-conversion/dto/score-conversion.dto';
import { ScoreConversionService } from '@score-conversion/score-conversion.service';
import { SubjectTaskPipe } from '@subject-task/pipe/subject-task.pipe';
import { SubjectDto } from '@subject/dto/subject.dto';
import { SubjectService } from '@subject/subject.service';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import {
    ApiCreatedResponse,
    ApiParam,
    ApiQuery,
    ApiTags
} from '@nestjs/swagger';
import { CreateSubjectResponseDto } from '@subject/dto/create-subject-response.dto';

@ApiTags('Admin Subject')
@Controller('admin/subject')
export class SubjectController {
    constructor(
        private readonly subjectService: SubjectService,
        private readonly scoreConversionService: ScoreConversionService
    ) {}

    @Post()
    @Permission(Permissions.CreateSubjects)
    @UseGuards(PermissionGuard)
    @ApiCreatedResponse({
        description: 'The subject has been successfully created.',
        type: () => CreateSubjectResponseDto
    })
    async create(
        @Body(SubjectTaskPipe) dto: SubjectDto,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.subjectService.create(dto, user.id);
    }

    @Post(':subjectId/score-conversion')
    @Permission(Permissions.CreateSubjects)
    @UseGuards(PermissionGuard)
    async saveScoreConversion(
        @Param('subjectId', ParseIntPipe) subjectId: number,
        @Body() dto: ScoreConversionDto
    ) {
        await this.scoreConversionService.save(subjectId, dto.scoreConversion);

        return HttpStatus.OK;
    }

    @Get(':id/score-conversion')
    @Permission(Permissions.Subjects)
    @UseGuards(PermissionGuard)
    async getScoreConversionBySubjectId(@Param('id', ParseIntPipe) id: number) {
        return await this.subjectService.getScoreConversionById(id);
    }

    @Get()
    @Permission(Permissions.Education)
    @UseGuards(PermissionGuard)
    @ApiQuery({
        name: 'limit',
        required: true,
        example: 5
    })
    @ApiQuery({
        name: 'offset',
        required: true,
        example: 0
    })
    async find(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number
    ) {
        return await this.subjectService.find(limit, offset, false);
    }

    @Get('archived')
    @Permission(Permissions.Archive)
    @UseGuards(PermissionGuard)
    async findArchived(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number
    ) {
        return await this.subjectService.find(limit, offset, true);
    }

    @Delete(':id')
    @Permission(Permissions.DeleteSubjects)
    @UseGuards(PermissionGuard)
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.subjectService.delete(id);
    }

    @Patch(':id')
    @Permission(Permissions.UpdateSubjects)
    @UseGuards(PermissionGuard)
    @ApiCreatedResponse({
        description: 'The subject has been successfully updated.',
        type: () => CreateSubjectResponseDto
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body(SubjectTaskPipe) dto: SubjectDto,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.subjectService.update(id, dto, user.id);
    }

    @Patch(':id/toggle-publish')
    @Permission(Permissions.UpdateSubjects)
    @UseGuards(PermissionGuard)
    async publish(@Param('id', ParseIntPipe) id: number) {
        return await this.subjectService.toggleIsPublished(id);
    }

    @UseInterceptors(CacheInterceptor)
    @Get(':id')
    @Permission(Permissions.Subjects)
    @UseGuards(PermissionGuard)
    @ApiParam({
        name: 'id',
        example: 42
    })
    async getFullInfoById(@Param('id', ParseIntPipe) id: number) {
        return await this.subjectService.getFullInfoById(id);
    }

    @Delete(':id/archive')
    @Permission(Permissions.DeleteSubjects)
    @UseGuards(PermissionGuard)
    async archive(@Param('id', ParseIntPipe) id: number) {
        return await this.subjectService.toggleIsArchived(id, true);
    }

    @Patch(':id/restore')
    @Permission(Permissions.UpdateSubjects)
    @UseGuards(PermissionGuard)
    async restore(@Param('id', ParseIntPipe) id: number) {
        return await this.subjectService.toggleIsArchived(id, false);
    }

    @Get(':id/subject-task')
    @Permission(Permissions.Education)
    @UseGuards(PermissionGuard)
    async getSubjectTasksById(@Param('id', ParseIntPipe) id: number) {
        return await this.subjectService.getSubjectTasksById(id);
    }

    @Get(':id/task-info')
    @Permission(Permissions.Subjects)
    @UseGuards(PermissionGuard)
    async getTaskInfoById(@Param('id', ParseIntPipe) id: number) {
        return await this.subjectService.getTaskInfoById(id);
    }
}
