import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CacheInterceptor } from '@nestjs/cache-manager';

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
}
