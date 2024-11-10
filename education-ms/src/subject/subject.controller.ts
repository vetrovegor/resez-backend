import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    UseInterceptors
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Public } from '@auth/decorators/public.decorator';

@Public()
@Controller('subject')
export class SubjectController {
    constructor(private readonly subjectService: SubjectService) {}

    @Get()
    async getPublished() {
        return await this.subjectService.getPublished();
    }

    @UseInterceptors(CacheInterceptor)
    @Get(':slug/score-info')
    async getScoreConversionBySubjectSlug(@Param('slug') slug: string) {
        return await this.subjectService.getScoreInfo(slug);
    }

    @Get(':slug/task-info')
    async getTaskInfoById(@Param('slug') slug: string) {
        return await this.subjectService.getTaskInfoBySlug(slug);
    }

    @Get(':id/task-analisys')
    async getTaskAnalisysById(@Param('id', ParseIntPipe) id: number) {
        return await this.subjectService.getTaskAnalisysById(id);
    }
}
