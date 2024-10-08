import { Permission } from '@auth/decorators/permission.decorator';
import { PermissionGuard } from '@auth/guards/permission.guard';
import { Permissions } from '@auth/interfaces/interfaces';
import { LogType } from '@log/log.entity';
import { LogService } from '@log/log.service';
import { LogTypePipe } from '@log/pipe/log-type.pipe';
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
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
        @Query('type', LogTypePipe)
        type: LogType
    ) {
        return await this.logService.find(limit, offset, type);
    }

    @Get(':id')
    @Permission(Permissions.Logs)
    @UseGuards(PermissionGuard)
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.logService.getById(id);
    }
}
