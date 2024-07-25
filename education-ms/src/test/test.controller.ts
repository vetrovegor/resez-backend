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
    async findOfficialBySubjectSlug(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
        // подумать как сделать чтобы параметр был обязательным
        @Query('subject_slug', new DefaultValuePipe(''))
        subjectSlug: string
    ) {
        return await this.testService.findOfficialBySubjectSlug(
            limit,
            offset,
            subjectSlug
        );
    }

    @Get(':id')
    async getFullInfo(@Param('id', ParseIntPipe) id: number) {
        return await this.testService.getFullInfo(id);
    }
}
