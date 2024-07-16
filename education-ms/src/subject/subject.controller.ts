import { Controller, Get, Param } from '@nestjs/common';
import { SubjectService } from './subject.service';

@Controller('subject')
export class SubjectController {
    constructor(private readonly subjectService: SubjectService) {}

    @Get()
    async getPublished() {
        return await this.subjectService.getPublished();
    }

    @Get(':slug/score-info')
    async getScoreConversionBySubjectSlug(@Param('slug') slug: string) {
        return await this.subjectService.getScoreInfo(slug);
    }
}
