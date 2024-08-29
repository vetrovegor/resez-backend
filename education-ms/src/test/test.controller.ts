import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import { TestService } from './test.service';
import { Public } from '@auth/decorators/public.decorator';
import { TestSubmitDto } from './dto/test-submit.dto';
import { OptionalJwtAuthGuard } from '@auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { JwtPayload } from '@auth/interfaces/interfaces';

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

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Post(':id/submit')
    async evaluate(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: TestSubmitDto,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.testService.evaluate(id, dto, user.id);
    }
}
