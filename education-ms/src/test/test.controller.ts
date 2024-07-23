import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Query
} from '@nestjs/common';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
    constructor(private readonly testService: TestService) {}

    @Get('official')
    async findOfficial(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
        @Query('subject_id', new ParseIntPipe({ optional: true }))
        subjectId: number
    ) {
        return await this.testService.find(
            limit,
            offset,
            subjectId,
            null,
            true
        );
    }

    @Get(':id')
    async getFullInfo(@Param('id', ParseIntPipe) id: number) {
        return await this.testService.getFullInfo(id);
    }
}
