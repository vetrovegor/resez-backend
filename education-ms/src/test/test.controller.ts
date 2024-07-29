import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query
} from '@nestjs/common';
import { TestService } from './test.service';
import { Public } from '@auth/public.decorator';
import { TestSubmitDto } from './dto/test-dubmit.dto';

@Public()
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

    @Get(':id/task/detailed')
    async getDetailedTasksByTestId(@Param('id', ParseIntPipe) id: number) {
        return await this.testService.getDetailedTasksByTestId(id);
    }

    @Post(':id/submit')
    async evaluate(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: TestSubmitDto
    ) {
        return await this.testService.evaluate(id, dto);
    }
}
