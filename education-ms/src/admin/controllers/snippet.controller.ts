import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { Permission } from '@auth/decorators/permission.decorator';
import { PermissionGuard } from '@auth/guards/permission.guard';
import { JwtPayload, Permissions } from '@auth/interfaces/interfaces';
import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import { SnippetDto } from '@snippet/dto/snippet.dto';
import { SnippetService } from '@snippet/snippet.service';

@Controller('admin/snippet')
export class SnippetController {
    constructor(private readonly snippetService: SnippetService) {}

    @Post()
    @Permission(Permissions.CreateTasks)
    @UseGuards(PermissionGuard)
    async create(@Body() dto: SnippetDto, @CurrentUser() user: JwtPayload) {
        return await this.snippetService.create(dto, user.id);
    }

    @Get()
    @Permission(Permissions.Tasks)
    @UseGuards(PermissionGuard)
    async find(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
        @Query('subject_id', new ParseIntPipe({ optional: true }))
        subjectId: number
    ) {
        return await this.snippetService.find({
            limit,
            offset,
            subjectId
        });
    }

    @Patch(':id')
    @Permission(Permissions.CreateTasks)
    @UseGuards(PermissionGuard)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: SnippetDto
    ) {
        return await this.snippetService.update(id, dto);
    }

    @Delete(':id')
    @Permission(Permissions.CreateTasks)
    @UseGuards(PermissionGuard)
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.snippetService.delete(id);
    }
}
