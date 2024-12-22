import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { Permission } from '@auth/decorators/permission.decorator';
import { PermissionGuard } from '@auth/guards/permission.guard';
import { JwtPayload, Permissions } from '@auth/interfaces/interfaces';
import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TaskAnalysisDto } from '@task-analysis/dto/task-analysis.dto';
import { TaskAnalysisService } from '@task-analysis/task-analysis.service';

@ApiTags('Admin Task analysis')
@Controller('admin/task-analysis')
export class TaskAnalysisController {
    constructor(private readonly taskAnalysisService: TaskAnalysisService) {}

    @Post()
    @Permission(Permissions.AnalysisTasks)
    @UseGuards(PermissionGuard)
    async create(
        @Body() dto: TaskAnalysisDto,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.taskAnalysisService.create(dto, user.id);
    }

    @Patch(':id/toggle-publish')
    @Permission(Permissions.AnalysisTasks)
    @UseGuards(PermissionGuard)
    async toggleIsVerified(@Param('id', ParseIntPipe) id: number) {
        return await this.taskAnalysisService.toggleIsPublished(id);
    }

    @Get()
    @Permission(Permissions.AnalysisTasks)
    @UseGuards(PermissionGuard)
    async find(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number
    ) {
        return await this.taskAnalysisService.find(limit, offset);
    }

    @Get(':id')
    @Permission(Permissions.AnalysisTasks)
    @UseGuards(PermissionGuard)
    async findFullInfoById(@Param('id', ParseIntPipe) id: number) {
        return await this.taskAnalysisService.findFullInfoById(id);
    }
}
