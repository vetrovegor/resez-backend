import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { JwtPayload, Permissions } from '@auth/interfaces/interfaces';
import { Permission } from '@auth/decorators/permission.decorator';
import { PermissionGuard } from '@auth/guards/permission.guard';
import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseBoolPipe,
    ParseIntPipe,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import { CustomTestDto } from '@test/dto/custom-test.dto';
import { ExamTestDto } from '@test/dto/exam-test.dto';
import { TestService } from '@test/test.service';

@Controller('admin/test')
export class TestController {
    constructor(private readonly testService: TestService) {}

    @Post('exam')
    @Permission(Permissions.CreateOfficialTests)
    @UseGuards(PermissionGuard)
    async generateExamTest(
        @Body() dto: ExamTestDto,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.testService.generateExamTest(dto, user.id);
    }

    @Post('custom')
    @Permission(Permissions.CreateOfficialTests)
    @UseGuards(PermissionGuard)
    async generateCustomTest(
        @Body() dto: CustomTestDto,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.testService.generateCustomTest(dto, user.id);
    }

    @Get()
    @Permission(Permissions.Tests)
    @UseGuards(PermissionGuard)
    async find(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
        @Query('subject_id', new ParseIntPipe({ optional: true }))
        subjectId: number,
        @Query('user_id', new ParseIntPipe({ optional: true }))
        userId: number,
        @Query('is_official', new ParseBoolPipe({ optional: true }))
        isOfficial: boolean
    ) {
        return await this.testService.find(
            limit,
            offset,
            subjectId,
            userId,
            isOfficial
        );
    }

    @Delete(':id')
    @Permission(Permissions.DeleteTests)
    @UseGuards(PermissionGuard)
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.testService.delete(id);
    }
}
