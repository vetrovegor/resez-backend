import { Permission } from '@auth/decorators/permission.decorator';
import { PermissionGuard } from '@auth/guards/permission.guard';
import { Permissions } from '@auth/interfaces/interfaces';
import {
    Body,
    Controller,
    Delete,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { SourceRequestDto } from '@source/dto/source-request.dto';
import { SourceResponseDto } from '@source/dto/source-response.dto';
import { SourceService } from '@source/source.service';

@Controller('admin/source')
export class SourceController {
    constructor(private readonly sourceService: SourceService) {}

    @Post()
    @Permission(Permissions.Tasks)
    @UseGuards(PermissionGuard)
    @ApiResponse({
        status: 200,
        description: 'Success',
        type: SourceResponseDto
    })
    async create(@Body() dto: SourceRequestDto) {
        return await this.sourceService.create(dto);
    }

    @Patch(':id')
    @Permission(Permissions.Tasks)
    @UseGuards(PermissionGuard)
    @ApiResponse({
        status: 200,
        description: 'Success',
        type: SourceResponseDto
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: SourceRequestDto
    ) {
        return await this.sourceService.update(id, dto);
    }

    @Delete(':id')
    @Permission(Permissions.Tasks)
    @UseGuards(PermissionGuard)
    @ApiResponse({
        status: 200,
        description: 'Success',
        type: SourceResponseDto
    })
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.sourceService.delete(id);
    }
}
