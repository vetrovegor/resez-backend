import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
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

    @Get(':subjectId/score-conversion')
    async getScoreConversionBySubjectId(
        @Param('subjectId', ParseIntPipe) subjectId: number
    ) {
        return await this.scoreConversionService.getBySubjectId(subjectId);
    }
}
