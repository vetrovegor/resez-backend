import { Permission } from '@auth/decorators/permission.decorator';
import { PermissionGuard } from '@auth/guards/permission.guard';
import { Permissions } from '@auth/interfaces/interfaces';
import { LogService } from '@log/log.service';
import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Query,
    UseGuards
} from '@nestjs/common';

@Controller('admin/log')
export class LogController {
    constructor(private readonly logService: LogService) {}

    @Get()
    @Permission(Permissions.Logs)
    @UseGuards(PermissionGuard)
    async find(
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number
    ) {
        return await this.logService.find(limit, offset);
    }

    @Get(':id')
    @Permission(Permissions.Logs)
    @UseGuards(PermissionGuard)
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.logService.getById(id);
    }
}
