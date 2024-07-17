import { Permissions } from '@auth/interfaces';
import { Permission } from '@auth/permission.decorator';
import { PermissionGuard } from '@auth/permission.guard';
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
    UseGuards
} from '@nestjs/common';
import { ScoreConversionDto } from '@score-conversion/dto/score-conversion.dto';
import { ScoreConversionService } from '@score-conversion/score-conversion.service';
import { SubjectDto } from '@subject/dto/subject.dto';
import { SubjectService } from '@subject/subject.service';

@Controller('admin/subject')
export class AdminSubjectController {
    constructor(
        private readonly subjectService: SubjectService,
        private readonly scoreConversionService: ScoreConversionService
    ) {}

    @Post()
    @Permission(Permissions.CreateSubjects)
    @UseGuards(PermissionGuard)
    async create(@Body() dto: SubjectDto) {
        return await this.subjectService.create(dto);
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
    @Permission(Permissions.Subjects)
    @UseGuards(PermissionGuard)
    async find(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number
    ) {
        return await this.subjectService.find(limit, offset, false);
    }

    @Get('archived')
    @Permission(Permissions.Subjects)
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
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: SubjectDto
    ) {
        return await this.subjectService.update(id, dto);
    }

    @Patch(':id/toggle-publish')
    @Permission(Permissions.UpdateSubjects)
    @UseGuards(PermissionGuard)
    async publish(@Param('id', ParseIntPipe) id: number) {
        return await this.subjectService.toggleIsPublished(id);
    }

    @Get(':id')
    @Permission(Permissions.Subjects)
    @UseGuards(PermissionGuard)
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
}
