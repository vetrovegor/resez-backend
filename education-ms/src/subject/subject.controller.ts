import { Controller, Get, Param } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { ScoreConversionService } from '@score-conversion/score-conversion.service';

@Controller('subject')
export class SubjectController {
    constructor(
        private readonly subjectService: SubjectService,
        private readonly scoreConversionService: ScoreConversionService
    ) {}

    @Get()
    async getPublished() {
        return await this.subjectService.getPublished();
    }

    @Get(':slug/score-conversion')
    async getScoreConversionBySubjectSlug(@Param('slug') slug: string) {
        return await this.scoreConversionService.getBySubjectSlug(slug);
    }
}
